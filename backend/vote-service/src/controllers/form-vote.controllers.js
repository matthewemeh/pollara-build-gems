const moment = require('moment');
const { hash } = require('argon2');
const express = require('express');
const mongoose = require('mongoose');
const { Redis } = require('ioredis');
const { v4: uuidv4 } = require('uuid');
const SHA256 = require('crypto-js/sha256');
const { StatusCodes } = require('http-status-codes');

const Form = require('../models/form.model');
const { logger } = require('../utils/logger.utils');
const FormVote = require('../models/form-vote.model');
const { sendEmail } = require('../utils/email.utils');
const { sortObject } = require('../utils/index.utils');
const FormVoted = require('../models/form-voted.model');
const FormResult = require('../models/form-result.model');
const { APIError } = require('../middlewares/error.middlewares');
const { sendNotification } = require('../utils/notification.utils');
const { validateGetVotes, validateVerifyUserVote } = require('../utils/validation.utils');
const {
  deleteCacheKey,
  getVoteTokenKey,
  getFormVotesKey,
  redisCacheExpiry,
  getFormsVotedKey,
  getFormVoteVerifyKey,
  deleteCachePatternAsync,
} = require('../utils/redis.utils');

/**
 * @param {express.Request & {redisClient: Redis}} req
 * @param {express.Response} res
 */
const fillForm = async (req, res) => {
  logger.info('Fill Form endpoint called');

  const { form, user } = req;
  const { pollVotes, formID } = req.body;

  // create or update results. This whole process is to avoid race conditions
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // Find or create the Result document for the form
    let resultDoc = await FormResult.findOne({ form: formID }).session(session);
    if (!resultDoc) {
      resultDoc = new FormResult({ form: formID });
      await resultDoc.save({ session });
    }

    // Update results for each poll vote
    for (const { pollID, optionIDs } of pollVotes) {
      let pollResult = resultDoc.results.find(r => r.poll == pollID);

      if (!pollResult) {
        pollResult = resultDoc.results.create({ poll: pollID, options: [] });
        resultDoc.results.push(pollResult);
      }

      optionIDs.forEach(optionID => {
        let optionResult = pollResult.options.find(o => o.optionID === optionID);
        if (optionResult) {
          optionResult.votes += 1;
        } else {
          pollResult.options.push({ optionID, votes: 1 });
        }
      });
    }

    resultDoc.markModified('results');

    await resultDoc.save({ session });

    await session.commitTransaction();
  } catch (err) {
    logger.error('Form fill failed:', err);
    await session.abortTransaction();

    if (form.identityCheck) {
      // send user a notification and an email
      await sendNotification({
        user,
        notifyEmail: true,
        subject: 'POLLARA: Unsuccessful Form Fill',
        message: `Your filled form: ${form.name} wasn't registered. Please try again`,
      });
    }

    throw err;
  } finally {
    session.endSession();
  }

  // find last vote for that form
  const lastVote = await FormVote.findOne({ form: formID, isTailNode: true });

  // assume new vote is the first vote or genesis node
  const votePayload = {
    index: 0,
    hash: '',
    form: formID,
    previousHash: '',
    isTailNode: true,
    timestamp: Date.now(),
    data: { pollVotes, form: formID },
  };
  if (lastVote) {
    votePayload.index = lastVote.index + 1;
    votePayload.previousHash = lastVote.hash;

    lastVote.isTailNode = false;
    await lastVote.save();
  }

  // create hash for vote which protects it from mutation
  const normalizedData = sortObject(votePayload.data);
  votePayload.hash = SHA256(
    votePayload.index +
      votePayload.previousHash +
      votePayload.timestamp +
      JSON.stringify(normalizedData)
  ).toString();

  // add vote to blockchain of votes
  const vote = await FormVote.create(votePayload);

  if (form.identityCheck) {
    // update the user's voted forms
    await FormVoted.create({ user: user._id, form: formID });

    // delete user's voted forms cache
    const formsVotedCacheKey = getFormsVotedKey(user._id);
    await deleteCacheKey(formsVotedCacheKey, req.redisClient);

    // invalidate Vote Token
    const voteTokenKey = getVoteTokenKey(user._id);
    await deleteCacheKey(voteTokenKey, req.redisClient);

    // send user a notification and an email
    await sendNotification({
      user,
      message: `You filled the form: ${form.name} at ${moment(vote.createdAt).format(
        'LLL'
      )}. Your Form VoteID: ${vote._id} can be used to verify your filled form's integrity`,
    });
    await sendEmail(
      user.email.value,
      'POLLARA: Form filled successfully',
      null,
      `<p>Hi ${user.fullName}</p>
      <p>You filled the form: ${form.name} at ${moment(vote.createdAt).format(
        'LLL'
      )}. You can use your Form VoteID below to verify your filled form's integrity</p>
      <em>${vote._id}</em>
      <p>Best regards,<span style="display:block;">Pollara.</span></p>
      `
    );
  }

  logger.info('Form filled successfully');
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Form filled successfully',
    data: { voteID: vote._id },
  });
};

/**
 * @param {express.Request & {redisClient: Redis}} req
 * @param {express.Response} res
 */
const verifyUserForm = async (req, res) => {
  logger.info('Verify User Form endpoint called');

  // validate request body
  const { error, value: reqBody } = validateVerifyUserVote(req.body ?? {});
  if (error) {
    logger.warn('Validation error', { message: error.details[0].message });
    throw new APIError(error.details[0].message, StatusCodes.BAD_REQUEST);
  }

  const { voteID } = reqBody;

  // check cached verified form vote result
  const voteVerifyKey = getFormVoteVerifyKey(voteID);
  let result = await req.redisClient.get(voteVerifyKey);
  if (result) {
    logger.info('Form checked successfully');
    return res
      .status(StatusCodes.OK)
      .json({ success: true, message: 'Form checked successfully', data: JSON.parse(result) });
  }

  // check if vote exists
  const vote = await FormVote.findById(voteID);
  if (!vote) {
    logger.error('Form Vote not found');
    throw new APIError('Form Vote not found', StatusCodes.NOT_FOUND);
  }

  // find the vote just before this vote
  const previousVote = await FormVote.findOne({
    index: vote.index - 1,
    'data.form': vote.data.form,
  });

  const form = await Form.findById(vote.data.form).select('-_id name');
  result = {
    form,
    status: 'failed',
    voteTimestamp: vote.timestamp,
    message: 'Form verification failed. Form compromised!',
  };

  // verify that vote was not tampered with
  if (vote.isValid(previousVote)) {
    result.status = 'success';
    result.message = 'Form verification successful';
  } else {
    await FormVote.findByIdAndUpdate(voteID, { isInvalid: true });
    // invalidate votes cache for that form
    const votesKey = getFormVotesKey(vote.data.form, '*');
    deleteCachePatternAsync(votesKey, req.redisClient);
  }

  // cache new verified vote result
  await req.redisClient.setex(voteVerifyKey, redisCacheExpiry, JSON.stringify(result));

  logger.info('Form checked successfully');
  res
    .status(StatusCodes.OK)
    .json({ success: true, message: 'Form checked successfully', data: result });
};

/**
 * @param {express.Request & {redisClient: Redis}} req
 * @param {express.Response} res
 */
const getVotes = async (req, res) => {
  logger.info('Get Votes endpoint called');

  // validate request query
  const { error, value: reqQuery } = validateGetVotes(req.query);
  if (error) {
    logger.warn('Query Validation error', { message: error.details[0].message });
    throw new APIError(error.details[0].message, StatusCodes.BAD_REQUEST);
  }

  const { id } = req.params; // form ID
  const { page, limit, sortBy } = reqQuery;

  // check for cached votes
  const votesKey = getFormVotesKey(id, page, limit, sortBy);
  let paginatedVotes = await req.redisClient.get(votesKey);
  if (paginatedVotes) {
    logger.info('Votes fetched successfully from cache');
    return res.status(StatusCodes.OK).json({
      success: true,
      data: JSON.parse(paginatedVotes),
      message: 'Votes fetched successfully',
    });
  }

  // fallback to DB
  const sort = sortBy ? JSON.parse(sortBy) : { timestamp: -1 };
  paginatedVotes = await FormVote.paginate({ form: id }, { page, limit, sort, select: '-__v' });

  // mask hash of each vote
  paginatedVotes.docs = paginatedVotes.docs.map(voteDoc => {
    const vote = voteDoc.toJSON();
    vote.hash = `${vote.hash.slice(0, 4)}****${vote.hash.slice(-4)}`;
    return vote;
  });

  // cache the fetched votes
  await req.redisClient.setex(votesKey, redisCacheExpiry, JSON.stringify(paginatedVotes));

  logger.info('Votes fetched successfully');
  res
    .status(StatusCodes.OK)
    .json({ success: true, message: 'Votes fetched successfully', data: paginatedVotes });
};

/**
 * @param {express.Request & {redisClient: Redis}} req
 * @param {express.Response} res
 */
const addVoteToken = async (req, res) => {
  logger.info('Add Vote Token endpoint called');

  const token = uuidv4();
  const hashedToken = await hash(token);
  const voteTokenKey = getVoteTokenKey(req.user._id);

  await req.redisClient.setex(voteTokenKey, redisCacheExpiry, hashedToken);

  logger.info('Vote Token created successfully');
  res
    .status(StatusCodes.OK)
    .json({ success: true, message: 'Vote Token created successfully', data: { token } });
};

module.exports = { getVotes, fillForm, verifyUserForm, addVoteToken };
