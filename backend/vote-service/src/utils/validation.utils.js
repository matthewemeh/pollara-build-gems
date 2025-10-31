const Joi = require('joi');

const paginationFields = {
  page: Joi.number().integer().positive().default(1),
  limit: Joi.number().integer().equal(10, 25, 50).default(10),
};

const validateCastElectionVote = data => {
  const schema = Joi.object({
    voteToken: Joi.string().required(),
    partyID: Joi.string()
      .pattern(/^[a-f0-9]{24}$/)
      .messages({ 'string.pattern.base': '"partyID" must be a valid ID' })
      .required(),
    electionID: Joi.string()
      .pattern(/^[a-f0-9]{24}$/)
      .messages({ 'string.pattern.base': '"electionID" must be a valid ID' })
      .required(),
  });

  return schema.validate(data);
};

const validateCastFormVote = data => {
  const schema = Joi.object({
    voteToken: Joi.string(),
    pollVotes: Joi.array().items(
      Joi.object({
        optionIDs: Joi.array().items(Joi.string()).required(),
        pollID: Joi.string()
          .pattern(/^[a-f0-9]{24}$/)
          .messages({ 'string.pattern.base': '"pollID" of all options must be a valid ID' })
          .required(),
      })
    ),
    formID: Joi.string()
      .pattern(/^[a-f0-9]{24}$/)
      .messages({ 'string.pattern.base': '"formID" must be a valid ID' })
      .required(),
  });

  return schema.validate(data);
};

const validateVerifyUserVote = data => {
  const schema = Joi.object({
    voteID: Joi.string()
      .pattern(/^[a-f0-9]{24}$/)
      .messages({ 'string.pattern.base': '"voteID" must be a valid ID' })
      .required(),
  });

  return schema.validate(data);
};

const validateGetVotes = data => {
  const schema = Joi.object({
    ...paginationFields,
    sortBy: Joi.string().trim(),
  });

  return schema.validate(data);
};

module.exports = {
  validateGetVotes,
  validateCastFormVote,
  validateVerifyUserVote,
  validateCastElectionVote,
};
