const express = require('express');
const { Redis } = require('ioredis');
const { StatusCodes } = require('http-status-codes');

require('../models/form.model');
require('../models/poll.model');
const { logger } = require('../utils/logger.utils');
const FormVoted = require('../models/form-voted.model');
const FormResult = require('../models/form-result.model');
const { APIError } = require('../middlewares/error.middlewares');
const { validateGetResults } = require('../utils/validation.utils');
const { getFormResultsKey, getFormResultKey, redisCacheExpiry } = require('../utils/redis.utils');

/**
 * @param {express.Request & {redisClient: Redis}} req
 * @param {express.Response} res
 */
const getResults = async (req, res) => {
  logger.info('Get Results endpoint called');

  // validate request query
  const { error, value: reqQuery } = validateGetResults(req.query);
  if (error) {
    logger.warn('Query Validation error', { message: error.details[0].message });
    throw new APIError(error.details[0].message, StatusCodes.BAD_REQUEST);
  }

  const { user } = req;
  const { page, limit, sortBy, startTime, endTime } = reqQuery;

  // check cached results
  const resultsCacheKey = getFormResultsKey(user._id, page, limit, sortBy, startTime, endTime);
  let paginatedResults = await req.redisClient.get(resultsCacheKey);
  if (paginatedResults) {
    logger.info('Results fetched successfully');
    return res.status(StatusCodes.OK).json({
      success: true,
      data: JSON.parse(paginatedResults),
      message: 'Results fetched successfully',
    });
  }

  // ensure to fetch only results of forms that the user filled
  const userFormsVoted = await FormVoted.find({ user: user._id });
  const forms = userFormsVoted.map(({ form }) => form);

  // fallback to DB
  const paginationFilters = { $and: [], form: { $in: forms } };
  if (startTime) {
    paginationFilters.$and.push({ createdAt: { $gte: startTime } });
  }
  if (endTime) {
    paginationFilters.$and.push({ createdAt: { $lte: endTime } });
  }
  if (paginationFilters.$and.length === 0) {
    delete paginationFilters.$and;
  }

  const sort = sortBy ? JSON.parse(sortBy) : { createdAt: -1 };
  paginatedResults = await FormResult.paginate(paginationFilters, {
    sort,
    page,
    limit,
    populate: { path: 'form', select: 'name' },
    select: 'form updatedAt results.options.votes',
  });

  // cache fetched results
  await req.redisClient.setex(resultsCacheKey, redisCacheExpiry, JSON.stringify(paginatedResults));

  logger.info('Results fetched successfully');
  res
    .status(StatusCodes.OK)
    .json({ success: true, message: 'Results fetched successfully', data: paginatedResults });
};

/**
 * @param {express.Request & {redisClient: Redis}} req
 * @param {express.Response} res
 */
const getResult = async (req, res) => {
  logger.info('Get Result endpoint called');

  const { id } = req.params; // form ID

  // check cached result
  const resultKey = getFormResultKey(id);
  let result = await req.redisClient.get(resultKey);
  if (result) {
    logger.info('Result fetched successfully');
    return res
      .status(StatusCodes.OK)
      .json({ success: true, message: 'Result fetched successfully', data: JSON.parse(result) });
  }

  // fallback to DB
  result = await FormResult.findOne({ form: id })
    .select('-_id -__v')
    .populate([
      { path: 'form', select: 'name -_id' },
      { path: 'results.poll', select: 'index options question' },
    ]);
  if (!result) {
    logger.error('Result not found');
    throw new APIError('Result not found', StatusCodes.NOT_FOUND);
  }

  // cache fetched results
  await req.redisClient.setex(resultKey, redisCacheExpiry, JSON.stringify(result));

  logger.info('Result fetched successfully');
  res
    .status(StatusCodes.OK)
    .json({ success: true, message: 'Result fetched successfully', data: result });
};

module.exports = { getResults, getResult };
