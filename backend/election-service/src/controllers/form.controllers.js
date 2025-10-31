const express = require('express');
const { Redis } = require('ioredis');
const { StatusCodes } = require('http-status-codes');

const Poll = require('../models/poll.model');
const Form = require('../models/form.model');
const { VISIBILITY } = require('../constants');
const { logger } = require('../utils/logger.utils');
const FormVoted = require('../models/form-voted.model');
const { supabaseStorage } = require('../services/supabase');
const { getOptionImageKey } = require('../utils/party.utils');
const { APIError } = require('../middlewares/error.middlewares');
const {
  getFormKey,
  getPollsKey,
  getFormsKey,
  getUserFormsKey,
  getFormsVotedKey,
  redisCacheExpiry,
  deleteCachePatternAsync,
} = require('../utils/redis.utils');
const {
  validatePoll,
  validateForm,
  validateGetForms,
  validateGetPolls,
  validateFormUpdate,
  validatePollUpdate,
  validateGetUserForms,
} = require('../utils/validation.utils');

/**
 * @param {express.Request & {redisClient: Redis}} req
 * @param {express.Response} res
 */
const addForm = async (req, res) => {
  logger.info('Add Form endpoint called');

  // validate request body
  const { error, value: reqBody } = validateForm(req.body ?? {});
  if (error) {
    logger.warn('Validation error', { message: error.details[0].message });
    throw new APIError(error.details[0].message, StatusCodes.BAD_REQUEST);
  }

  const { user } = req;

  // proceed to create form
  const form = await Form.create({ author: user._id, ...reqBody });

  // delete forms cache
  const formsCacheKey = getFormsKey(user._id, '*', 500);
  deleteCachePatternAsync(formsCacheKey, req.redisClient);

  // delete user forms cache
  const userFormsCacheKey = getUserFormsKey(user._id, '*');
  deleteCachePatternAsync(userFormsCacheKey, req.redisClient);

  logger.info('Form created');
  res.status(StatusCodes.CREATED).json({ success: true, message: 'Form created', data: form });
};

/**
 * @param {express.Request & {redisClient: Redis}} req
 * @param {express.Response} res
 */
const addPoll = async (req, res) => {
  logger.info('Populate Form endpoint called');

  // validate request body
  const { error, value: reqBody } = validatePoll(req.body ?? {});
  if (error) {
    logger.warn('Validation error', { message: error.details[0].message });
    throw new APIError(error.details[0].message, StatusCodes.BAD_REQUEST);
  }

  const { user } = req;
  const { id } = req.params; // form ID

  // check if form exists, has not opened and belongs to the person modifying it
  const form = await Form.findById(id);
  if (!form) {
    logger.error('Form not found');
    throw new APIError('Form not found', StatusCodes.NOT_FOUND);
  } else if (form.hasStarted) {
    logger.error('Form has already opened');
    throw new APIError('Form has already opened', StatusCodes.BAD_REQUEST);
  } else if (!form.author.equals(user._id)) {
    logger.error('Not owner of form');
    throw new APIError('You are not the owner of this form', StatusCodes.FORBIDDEN);
  }

  const lastPoll = await Poll.find({ form: id }).sort({ createdAt: -1 }).limit(1);
  const nextIndex = lastPoll[0] ? lastPoll[0].index + 1 : 0;

  const poll = new Poll({ form: id, index: nextIndex, ...reqBody });

  if (reqBody.optionsImageEnabled) {
    // Run all uploads in parallel
    const uploadPromises = poll.options.map(async option => {
      const optionImage = req.files?.find(({ fieldname }) => fieldname === option.id);
      if (!optionImage) {
        logger.warn('Validation error', { message: 'Some options are missing an image' });
        throw new APIError('Some options are missing an image', StatusCodes.BAD_REQUEST);
      }

      // Upload to Supabase Storage
      const filePath = getOptionImageKey(id, poll._id, option.id);
      const { error: supabaseError } = await supabaseStorage.upload(filePath, optionImage.buffer, {
        contentType: optionImage.mimetype,
        cacheControl: '3600',
      });

      if (supabaseError) throw supabaseError;

      // Get Public URL
      const {
        data: { publicUrl },
      } = supabaseStorage.getPublicUrl(filePath);

      // Update the option's imageUrl directly
      option.imageUrl = publicUrl;
    });

    // Wait for all uploads to complete. Stop everything if any deletion fails
    await Promise.all(uploadPromises);
  }

  await poll.save();

  // delete form polls cache
  const pollsCacheKey = getPollsKey(id, '*');
  deleteCachePatternAsync(pollsCacheKey, req.redisClient, 500);

  logger.info('Poll added to form successfully');
  res
    .status(StatusCodes.CREATED)
    .json({ success: true, message: 'Poll added to form successfully', data: null });
};

/**
 * @param {express.Request & {redisClient: Redis}} req
 * @param {express.Response} res
 */
const updatePoll = async (req, res) => {
  logger.info('Update Poll endpoint called');

  // validate request body
  const { error, value: reqBody } = validatePollUpdate(req.body ?? {});
  if (error) {
    logger.warn('Validation error', { message: error.details[0].message });
    throw new APIError(error.details[0].message, StatusCodes.BAD_REQUEST);
  }

  const { user } = req;
  const { id } = req.params; // poll ID

  // find poll
  const poll = await Poll.findById(id).populate('form');
  if (!poll) throw new APIError('Poll not found', StatusCodes.NOT_FOUND);

  const { form } = poll;
  if (!form) {
    logger.error('Form not found');
    throw new APIError('Form not found', StatusCodes.NOT_FOUND);
  } else if (form.hasStarted) {
    logger.error('Form has already opened');
    throw new APIError('Form has already opened', StatusCodes.BAD_REQUEST);
  } else if (!form.author.equals(user._id)) {
    logger.error('Not owner of form');
    throw new APIError('You are not the owner of this form', StatusCodes.FORBIDDEN);
  }

  const { options, ...pollDetails } = reqBody;
  Object.assign(poll, pollDetails);

  const deletedPollOptionIDs = [];

  if (options) {
    const pollOptionIDs = [];

    poll.options.forEach(option => {
      // simultaneously collate poll option ids while checking for and applying any option updates from request
      pollOptionIDs.push(option.id);

      const optionUpdate = options.find(opt => opt.id === option.id);
      if (optionUpdate) {
        Object.assign(option, optionUpdate);
      } else {
        deletedPollOptionIDs.push(option.id);
      }
    });

    // append any new poll options
    const newOptions = options.filter(opt => !pollOptionIDs.includes(opt.id));
    poll.options.push(...newOptions);

    // remove any deleted options
    poll.options = poll.options.filter(opt => !deletedPollOptionIDs.includes(opt.id));
  }

  // remove deleted option images if any
  if (poll.optionsImageEnabled && deletedPollOptionIDs.length) {
    const filePaths = deletedPollOptionIDs.map(optionID =>
      getOptionImageKey(form._id, id, optionID)
    );
    const { error: removeError } = await supabaseStorage.remove(filePaths);

    if (removeError) {
      logger.error('Failed to delete poll option image(s) from Supabase', removeError);
      throw new APIError(
        'Failed to delete poll option image(s) from Supabase',
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Parallel upload logic
  const uploadPromises = poll.options.map(async option => {
    if (!poll.optionsImageEnabled) return; // skip if option images are not enabled

    const optionImage = req.files?.find(({ fieldname }) => fieldname === option.id);
    if (!optionImage) return; // skip if no image provided

    const filePath = getOptionImageKey(form._id, id, option.id);

    const { error: uploadError } = await supabaseStorage.upload(filePath, optionImage.buffer, {
      contentType: optionImage.mimetype,
      cacheControl: '3600',
      upsert: true,
    });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabaseStorage.getPublicUrl(filePath);

    // Since the image might be updated with same file path, we need to invalidate the cache via cache busting
    option.imageUrl = `${publicUrl}?cb=${Date.now()}`;
  });

  // Wait for all uploads to complete. Stop everything if any deletion fails
  await Promise.all(uploadPromises);

  await poll.save();

  // delete form polls cache
  const pollsCacheKey = getPollsKey(form._id, '*');
  deleteCachePatternAsync(pollsCacheKey, req.redisClient, 500);

  logger.info('Poll updated successfully');
  res
    .status(StatusCodes.OK)
    .json({ success: true, message: 'Poll updated successfully', data: null });
};

/**
 * @param {express.Request & {redisClient: Redis}} req
 * @param {express.Response} res
 */
const getUserForms = async (req, res) => {
  logger.info('Get User Forms endpoint called');

  // validate request query
  const { error, value: reqQuery } = validateGetUserForms(req.query);
  if (error) {
    logger.warn('Query Validation error', { message: error.details[0].message });
    throw new APIError(error.details[0].message, StatusCodes.BAD_REQUEST);
  }

  const { user } = req;
  const { page, limit, sortBy, ...docQuery } = reqQuery;
  const { startTime, endTime, name, visibility, identityCheck } = docQuery;

  // check cache for user forms
  const userFormsKey = getUserFormsKey(
    user._id,
    page,
    limit,
    sortBy,
    name,
    endTime,
    startTime,
    visibility,
    identityCheck
  );
  let paginatedForms = await req.redisClient.get(userFormsKey);
  if (paginatedForms) {
    logger.info('Forms fetched successfully');
    return res.status(StatusCodes.OK).json({
      success: true,
      data: JSON.parse(paginatedForms),
      message: 'Forms fetched successfully',
    });
  }

  // fetch user forms only
  docQuery.author = user._id;

  if (name) {
    docQuery.name = { $regex: `^${docQuery.name}`, $options: 'i' };
  }

  if (startTime) {
    docQuery.startTime = { $gte: startTime };
  }

  if (endTime) {
    docQuery.endTime = { $lte: endTime };
  }

  // fallback to DB
  const sort = sortBy ? JSON.parse(sortBy) : { startTime: -1 };
  paginatedForms = await Form.paginate(docQuery, {
    sort,
    page,
    limit,
    select: '-author -createdAt -updatedAt -__v',
  });

  // cache fetched user forms
  await req.redisClient.setex(userFormsKey, redisCacheExpiry, JSON.stringify(paginatedForms));

  logger.info('Forms fetched successfully');
  res
    .status(StatusCodes.OK)
    .json({ success: true, data: paginatedForms, message: 'Forms fetched successfully' });
};

/**
 * @param {express.Request & {redisClient: Redis}} req
 * @param {express.Response} res
 */
const getUserVotedForms = async (req, res) => {
  logger.info('Get User Voted Forms endpoint called');

  const { user } = req;

  // check cache for user voted forms
  const formsVotedCacheKey = getFormsVotedKey(user._id);
  let votedForms = await req.redisClient.get(formsVotedCacheKey);
  if (votedForms) {
    logger.info('Voted Forms fetched successfully');
    return res.status(StatusCodes.OK).json({
      success: true,
      data: JSON.parse(votedForms),
      message: 'Voted Forms fetched successfully',
    });
  }

  votedForms = await FormVoted.find({ user: user._id }).select('form createdAt -_id');

  // cache fetched user voted forms
  await req.redisClient.setex(formsVotedCacheKey, 86_400, JSON.stringify(votedForms));

  logger.info('Voted Forms fetched successfully');
  res.status(StatusCodes.OK).json({
    success: true,
    data: votedForms,
    message: 'Voted Forms fetched successfully',
  });
};

/**
 * @param {express.Request & {redisClient: Redis}} req
 * @param {express.Response} res
 */
const getForms = async (req, res) => {
  logger.info('Get Forms endpoint called');

  // validate request query
  const { error, value: reqQuery } = validateGetForms(req.query);
  if (error) {
    logger.warn('Query Validation error', { message: error.details[0].message });
    throw new APIError(error.details[0].message, StatusCodes.BAD_REQUEST);
  }

  const { user } = req;
  const { page, limit, sortBy, ...docQuery } = reqQuery;
  const { startTime, endTime, name, identityCheck } = docQuery;

  // check cache for user forms
  const userFormsKey = getFormsKey(
    user._id,
    page,
    limit,
    sortBy,
    name,
    endTime,
    startTime,
    identityCheck
  );
  let paginatedForms = await req.redisClient.get(userFormsKey);
  if (paginatedForms) {
    logger.info('Forms fetched successfully');
    return res.status(StatusCodes.OK).json({
      success: true,
      data: JSON.parse(paginatedForms),
      message: 'Forms fetched successfully',
    });
  }

  // fetch public forms and forms created by the user as well
  docQuery.$or = [{ visibility: VISIBILITY.PUBLIC }, { author: user._id }];

  if (name) {
    docQuery.name = { $regex: name, $options: 'i' };
  }

  if (startTime) {
    docQuery.startTime = { $gte: startTime };
  }

  if (endTime) {
    docQuery.endTime = { $lte: endTime };
  }

  // fallback to DB
  const sort = sortBy ? JSON.parse(sortBy) : { startTime: -1 };
  paginatedForms = await Form.paginate(docQuery, {
    sort,
    page,
    limit,
    select: '-author -createdAt -updatedAt -__v',
  });

  // cache fetched user forms
  await req.redisClient.setex(userFormsKey, redisCacheExpiry, JSON.stringify(paginatedForms));

  logger.info('Forms fetched successfully');
  res
    .status(StatusCodes.OK)
    .json({ success: true, data: paginatedForms, message: 'Forms fetched successfully' });
};

/**
 * @param {express.Request & {redisClient: Redis}} req
 * @param {express.Response} res
 */
const getForm = async (req, res) => {
  logger.info('Get Form endpoint called');

  const { id } = req.params;
  const formCacheKey = getFormKey(id);

  // check cache
  let form = await req.redisClient.get(formCacheKey);
  if (form) {
    logger.info('Form fetched successfully');
    return res
      .status(StatusCodes.OK)
      .json({ success: true, data: JSON.parse(form), message: 'Form fetched successfully' });
  }

  // fallback to DB
  form = await Form.findById(id).populate({ path: 'author', select: 'firstName lastName' });

  if (!form) {
    logger.error('Form not found');
    throw new APIError('Form not found', StatusCodes.NOT_FOUND);
  }

  // cache fetched user form
  await req.redisClient.setex(formCacheKey, redisCacheExpiry, JSON.stringify(form));

  logger.info('Form fetched successfully');
  res
    .status(StatusCodes.OK)
    .json({ success: true, data: form, message: 'Form fetched successfully' });
};

/**
 * @param {express.Request & {redisClient: Redis}} req
 * @param {express.Response} res
 */
const getPolls = async (req, res) => {
  logger.info('Get Polls endpoint called');

  // validate request query
  const { error, value: reqQuery } = validateGetPolls(req.query);
  if (error) {
    logger.warn('Query Validation error', { message: error.details[0].message });
    throw new APIError(error.details[0].message, StatusCodes.BAD_REQUEST);
  }

  const { id } = req.params; // form ID
  const { page, limit, sortBy, ...docQuery } = reqQuery;
  const { optionsImageEnabled } = docQuery;

  // check cache for form polls
  const pollsKey = getPollsKey(id, page, limit, sortBy, optionsImageEnabled);
  let paginatedPolls = await req.redisClient.get(pollsKey);
  if (paginatedPolls) {
    logger.info('Polls fetched successfully');
    return res.status(StatusCodes.OK).json({
      success: true,
      data: JSON.parse(paginatedPolls),
      message: 'Polls fetched successfully',
    });
  }

  // fetch polls from the specified form (id) only
  docQuery.form = id;

  // fallback to DB
  const sort = sortBy ? JSON.parse(sortBy) : { index: 1 };
  paginatedPolls = await Poll.paginate(docQuery, {
    sort,
    page,
    limit,
    select: '-form -createdAt -updatedAt -__v',
  });

  // cache fetched user forms
  await req.redisClient.setex(pollsKey, redisCacheExpiry, JSON.stringify(paginatedPolls));

  logger.info('Polls fetched successfully');
  res
    .status(StatusCodes.OK)
    .json({ success: true, data: paginatedPolls, message: 'Polls fetched successfully' });
};

/**
 * @param {express.Request & {redisClient: Redis}} req
 * @param {express.Response} res
 */
const updateForm = async (req, res) => {
  logger.info('Update Form endpoint called');

  // validate request body
  const { error, value: reqBody } = validateFormUpdate(req.body ?? {});
  if (error) {
    logger.warn('Validation error', { message: error.details[0].message });
    throw new APIError(error.details[0].message, StatusCodes.BAD_REQUEST);
  }

  // update the form
  const { user } = req;
  const { id } = req.params; // form ID

  // check if form exists and belongs to the person modifying it
  const form = await Form.findById(id);

  if (!form) {
    logger.error('Form not found');
    throw new APIError('Form not found', StatusCodes.NOT_FOUND);
  } else if (!form.author.equals(user._id)) {
    logger.error('Not owner of form');
    throw new APIError('You are not the owner of this form', StatusCodes.FORBIDDEN);
  }

  // check if fields are editable
  if (reqBody.endTime && form.hasEnded) {
    logger.info('Closed form cannot be edited');
    throw new APIError('Closed form cannot be edited', StatusCodes.BAD_REQUEST);
  } else if ((reqBody.startTime || reqBody.name) && form.hasStarted) {
    logger.info('Opened form cannot be edited');
    throw new APIError('Opened form cannot be edited', StatusCodes.BAD_REQUEST);
  }

  // if form visibility is turned from PRIVATE to PUBLIC or isn't changed from PRIVATE, then clear forms cache for that user/author only
  // otherwise clear forms cache for everyone
  const formsCacheKey =
    form.visibility === VISIBILITY.PRIVATE &&
    (reqBody.visibility === VISIBILITY.PUBLIC || !reqBody.visibility)
      ? getFormsKey(user._id, '*')
      : getFormsKey('*');

  // proceed to update form
  Object.assign(form, reqBody);
  await form.save();

  // delete forms cache
  deleteCachePatternAsync(formsCacheKey, req.redisClient);

  // delete user forms cache
  const userFormsCacheKey = getUserFormsKey(user._id, '*');
  deleteCachePatternAsync(userFormsCacheKey, req.redisClient, 500);

  logger.info('Form updated successfully');
  res
    .status(StatusCodes.OK)
    .json({ success: true, message: 'Form updated successfully', data: null });
};

/**
 * @param {express.Request & {redisClient: Redis}} req
 * @param {express.Response} res
 */
const deleteForm = async (req, res) => {
  logger.info('Delete Form endpoint called');

  const { user } = req;
  const { id } = req.params; // form ID

  // check if form exists, has not opened and belongs to the person deleting it
  const form = await Form.findById(id);
  if (!form) {
    logger.error('Form not found');
    throw new APIError('Form not found', StatusCodes.NOT_FOUND);
  } else if (form.hasStarted) {
    logger.error('Form has already opened');
    throw new APIError('Form has already opened', StatusCodes.BAD_REQUEST);
  } else if (!form.author.equals(user._id)) {
    logger.error('Not owner of form');
    throw new APIError('You are not the owner of this form', StatusCodes.FORBIDDEN);
  }

  // fetch all options from forms that have options image enabled
  const polls = await Poll.find({ form: id, optionsImageEnabled: true });
  const filePaths = [];
  polls.forEach(poll => {
    poll.options.forEach(opt => {
      filePaths.push(getOptionImageKey(id, poll._id, opt.id));
    });
  });

  // if form has polls that contain options with images, delete them from Supabase
  if (filePaths.length) {
    const { error: removeError } = await supabaseStorage.remove(filePaths);

    if (removeError) {
      logger.error("Failed to delete form's poll's option images from Supabase", removeError);
      throw new APIError(
        "Failed to delete form's poll's option images from Supabase",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // remove all polls in that form
  await Poll.deleteMany({ form: id });

  // delete the form
  await Form.deleteOne({ _id: id });

  // delete forms cache
  const formsCacheKey =
    form.visibility === VISIBILITY.PUBLIC ? getFormsKey('*') : getFormsKey(user._id, '*');
  deleteCachePatternAsync(formsCacheKey, req.redisClient);

  // delete user forms cache
  const userFormsCacheKey = getUserFormsKey(user._id, '*');
  deleteCachePatternAsync(userFormsCacheKey, req.redisClient, 500);

  // delete form polls cache
  const pollsCacheKey = getPollsKey(id, '*');
  deleteCachePatternAsync(pollsCacheKey, req.redisClient, 500);

  logger.info('Form deleted successfully');
  res
    .status(StatusCodes.OK)
    .json({ success: true, message: 'Form deleted successfully', data: null });
};

/**
 * @param {express.Request & {redisClient: Redis}} req
 * @param {express.Response} res
 */
const deletePoll = async (req, res) => {
  logger.info('Delete Poll endpoint called');

  const { user } = req;
  const { id } = req.params; // poll ID

  // find poll and populate its form
  const poll = await Poll.findById(id).populate('form');
  if (!poll) {
    logger.error('Poll not found');
    throw new APIError('Poll not found', StatusCodes.NOT_FOUND);
  }

  const { form } = poll;
  if (!form) {
    logger.error('Form not found');
    throw new APIError('Form not found', StatusCodes.NOT_FOUND);
  } else if (form.hasStarted) {
    logger.error('Cannot delete polls from an opened form');
    throw new APIError('Cannot delete polls from an opened form', StatusCodes.BAD_REQUEST);
  } else if (!form.author.equals(user._id)) {
    logger.error('Not owner of form');
    throw new APIError('You are not the owner of this form', StatusCodes.FORBIDDEN);
  }

  // if poll has option images enabled, delete the option images from Supabase
  if (poll.optionsImageEnabled) {
    const filePaths = poll.options.map(option => getOptionImageKey(form._id, id, option.id));
    const { error: removeError } = await supabaseStorage.remove(filePaths);

    if (removeError) {
      logger.error("Failed to delete poll's option images from Supabase", removeError);
      throw new APIError(
        "Failed to delete poll's option images from Supabase",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // delete poll from database
  await Poll.deleteOne({ _id: id });

  // delete form polls cache
  const pollsCacheKey = getPollsKey(form._id, '*');
  deleteCachePatternAsync(pollsCacheKey, req.redisClient, 500);

  logger.info('Poll deleted successfully');
  res
    .status(StatusCodes.OK)
    .json({ success: true, message: 'Poll deleted successfully', data: null });
};

module.exports = {
  addForm,
  getForm,
  addPoll,
  getPolls,
  getForms,
  updatePoll,
  deletePoll,
  updateForm,
  deleteForm,
  getUserForms,
  getUserVotedForms,
};
