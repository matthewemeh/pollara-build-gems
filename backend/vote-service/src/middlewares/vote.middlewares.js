const express = require('express');
const { Redis } = require('ioredis');
const { verify } = require('argon2');
const { StatusCodes } = require('http-status-codes');

const Form = require('../models/form.model');
const Party = require('../models/party.model');
const { ERROR_CODES } = require('../constants');
const { logger } = require('../utils/logger.utils');
const { APIError } = require('./error.middlewares');
const Election = require('../models/election.model');
const { getVoteTokenKey } = require('../utils/redis.utils');
const { verifyToken } = require('../middlewares/auth.middlewares');
const { validateCastElectionVote, validateCastFormVote } = require('../utils/validation.utils');

/**
 * @param {express.Request & {redisClient: Redis}} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
const verifyElectionVote = async (req, res, next) => {
  const { user } = req;

  // validate request body
  const { error, value: reqBody } = validateCastElectionVote(req.body ?? {});
  if (error) {
    logger.warn('Validation error', { message: error.details[0].message });
    throw new APIError(error.details[0].message, StatusCodes.BAD_REQUEST);
  }

  const { electionID, partyID, voteToken } = reqBody;

  // check if vote token is expired
  const voteTokenKey = getVoteTokenKey(user._id);
  const hashedVoteToken = await req.redisClient.get(voteTokenKey);
  if (!hashedVoteToken) {
    logger.error('Vote Token has expired');
    throw new APIError(
      'Vote Token has expired',
      StatusCodes.GONE,
      null,
      ERROR_CODES.EXPIRED_VOTE_TOKEN
    );
  }

  // check if vote token is valid
  const isVoteTokenValid = await verify(hashedVoteToken, voteToken);
  if (!isVoteTokenValid) {
    logger.error('Invalid Vote Token');
    throw new APIError(
      'Invalid Vote Token',
      StatusCodes.BAD_REQUEST,
      null,
      ERROR_CODES.INVALID_VOTE_TOKEN
    );
  }

  // check if election exists
  const election = await Election.findById(electionID);
  if (!election) {
    logger.error('Election not found');
    throw new APIError('Election not found', StatusCodes.NOT_FOUND);
  }

  // check if election has started and is still ongoing
  if (!election.hasStarted) {
    logger.warn('Election has not started');
    throw new APIError('Election has not started', StatusCodes.BAD_REQUEST);
  } else if (election.hasEnded) {
    logger.warn('Election has ended');
    throw new APIError('Election has ended', StatusCodes.BAD_REQUEST);
  }

  // check if user is allowed to vote for the election
  if (!user.canVote(election.delimitationCode)) {
    throw new APIError('You cannot vote for this election', StatusCodes.BAD_REQUEST);
  }

  // check if user has voted before
  const userHasVoted = await user.hasVotedElection(electionID);
  if (userHasVoted) {
    throw new APIError(
      'You have voted for this election already!',
      StatusCodes.BAD_REQUEST,
      null,
      ERROR_CODES.DUPLICATE_VOTE
    );
  }

  // check if party exists
  const partyExists = await Party.findById(partyID);
  if (!partyExists) {
    logger.error('Party not found');
    throw new APIError('Party not found', StatusCodes.NOT_FOUND);
  }

  req.election = election;

  next();
};

/**
 * @param {express.Request & {redisClient: Redis}} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
const verifyFormVote = async (req, res, next) => {
  // validate request body
  const { error, value: reqBody } = validateCastFormVote(req.body ?? {});
  if (error) {
    logger.warn('Validation error', { message: error.details[0].message });
    throw new APIError(error.details[0].message, StatusCodes.BAD_REQUEST);
  }

  const { formID, voteToken } = reqBody;

  // check if form exists, has started and is still ongoing
  const form = await Form.findById(formID);
  if (!form) {
    logger.error('Form not found');
    throw new APIError('Form not found', StatusCodes.NOT_FOUND);
  } else if (!form.hasStarted) {
    logger.warn('Form has not started');
    throw new APIError('Form has not started', StatusCodes.BAD_REQUEST);
  } else if (form.hasEnded) {
    logger.warn('Form has ended');
    throw new APIError('Form has ended', StatusCodes.BAD_REQUEST);
  }

  if (form.identityCheck) {
    await new Promise((resolve, reject) => {
      verifyToken(req, res, err => {
        if (err) return reject(err);
        resolve();
      });
    });

    const { user } = req;

    // check if vote token is expired
    const voteTokenKey = getVoteTokenKey(user._id);
    const hashedVoteToken = await req.redisClient.get(voteTokenKey);
    if (!hashedVoteToken) {
      logger.error('Vote Token has expired');
      throw new APIError(
        'Vote Token has expired',
        StatusCodes.GONE,
        null,
        ERROR_CODES.EXPIRED_VOTE_TOKEN
      );
    }

    // check if vote token is valid
    const isVoteTokenValid = await verify(hashedVoteToken, voteToken);
    if (!isVoteTokenValid) {
      logger.error('Invalid Vote Token');
      throw new APIError(
        'Invalid Vote Token',
        StatusCodes.BAD_REQUEST,
        null,
        ERROR_CODES.INVALID_VOTE_TOKEN
      );
    }

    // check if user has voted before
    const userHasVoted = await user.hasVotedForm(formID);
    if (userHasVoted) {
      throw new APIError(
        'You have voted for this form already!',
        StatusCodes.BAD_REQUEST,
        null,
        ERROR_CODES.DUPLICATE_VOTE
      );
    }
  }

  req.form = form;

  next();
};

module.exports = { verifyElectionVote, verifyFormVote };
