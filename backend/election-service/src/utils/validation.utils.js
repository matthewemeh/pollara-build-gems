const Joi = require('joi');

const { VISIBILITY } = require('../constants');

const paginationFields = {
  page: Joi.number().integer().positive().default(1),
  limit: Joi.number().integer().equal(10, 25, 50).default(10),
};

const validateElection = data => {
  const schema = Joi.object({
    endTime: Joi.date().required(),
    startTime: Joi.date().required(),
    name: Joi.string().trim().min(2).max(256).required(),
    delimitationCode: Joi.string().trim().max(20).allow(''),
  });

  return schema.validate(data);
};

const validateForm = data => {
  const schema = Joi.object({
    endTime: Joi.date().required(),
    startTime: Joi.date().required(),
    identityCheck: Joi.boolean().strict().default(true),
    name: Joi.string().trim().min(2).max(256).required(),
    visibility: Joi.string()
      .equal(...Object.values(VISIBILITY))
      .default(VISIBILITY.PRIVATE),
  });

  return schema.validate(data);
};

const validatePoll = data => {
  const schema = Joi.object({
    optionsImageEnabled: Joi.boolean().default(false),
    question: Joi.string().trim().max(1000).required(),
    maxSelectableOptions: Joi.number().integer().positive().default(1),
    options: Joi.alternatives()
      .try(
        Joi.array()
          .items(
            Joi.object({
              id: Joi.string().trim().max(40).required(),
              name: Joi.string().trim().max(500).required(),
            })
          )
          .min(2)
          .max(10)
          .messages({
            'array.min': 'A poll must have at least {{#limit}} options.',
            'array.max': 'A poll can have no more than {{#limit}} options.',
            'array.includesRequiredUnknowns': 'Each option must include id and name.',
          }),
        Joi.string().custom((value, helpers) => {
          try {
            const parsed = JSON.parse(value);
            if (!Array.isArray(parsed)) {
              throw new Error('Options must be an array');
            }
            return parsed;
          } catch {
            return helpers.error('any.invalid');
          }
        })
      )
      .messages({
        'any.invalid': 'Invalid options array.',
        'alternatives.match': 'Options must be an array or a valid JSON string.',
      })
      .required(),
  });

  return schema.validate(data);
};

const validatePollUpdate = data => {
  const schema = Joi.object({
    question: Joi.string().trim().max(1000),
    maxSelectableOptions: Joi.number().integer().positive(),
    options: Joi.alternatives()
      .try(
        Joi.array()
          .items(
            Joi.object({
              id: Joi.string().trim().max(40).required(),
              name: Joi.string().trim().max(500).required(),
            })
          )
          .min(2)
          .max(10)
          .messages({
            'array.min': 'A poll must have at least {{#limit}} options.',
            'array.max': 'A poll can have no more than {{#limit}} options.',
            'array.includesRequiredUnknowns': 'Each option must include id and name.',
          }),
        Joi.string().custom((value, helpers) => {
          try {
            const parsed = JSON.parse(value);
            if (!Array.isArray(parsed)) {
              throw new Error('Options must be an array');
            }
            return parsed;
          } catch {
            return helpers.error('any.invalid');
          }
        })
      )
      .messages({
        'any.invalid': 'Invalid options array.',
        'alternatives.match': 'Options must be an array or a valid JSON string.',
      }),
  });

  return schema.validate(data);
};

const validateElectionUpdate = data => {
  const schema = Joi.object({
    endTime: Joi.date(),
    startTime: Joi.date(),
    name: Joi.string().trim().min(2).max(256),
    delimitationCode: Joi.string().trim().max(20).allow(''),
  })
    .min(1)
    .messages({
      'object.min': 'At least {{#limit}} field must be provided.',
    });

  return schema.validate(data);
};

const validateFormUpdate = data => {
  const schema = Joi.object({
    endTime: Joi.date(),
    startTime: Joi.date(),
    identityCheck: Joi.boolean().strict(),
    name: Joi.string().trim().min(2).max(256),
    visibility: Joi.string().equal(...Object.values(VISIBILITY)),
  })
    .min(1)
    .messages({
      'object.min': 'At least {{#limit}} field must be provided.',
    });

  return schema.validate(data);
};

const validateElectionContestant = data => {
  const schema = Joi.object({
    contestantID: Joi.string()
      .pattern(/^[a-f0-9]{24}$/)
      .messages({ 'string.pattern.base': '"contestantID" must be a valid ID' })
      .required(),
  });

  return schema.validate(data);
};

const validateContestant = data => {
  const schema = Joi.object({
    stateOfOrigin: Joi.string().trim().max(30).required(),
    gender: Joi.string().equal('MALE', 'FEMALE').required(),
    lastName: Joi.string().trim().min(2).max(64).required(),
    firstName: Joi.string().trim().min(2).max(64).required(),
    middleName: Joi.string().trim().min(2).max(64).allow(''),
    party: Joi.string()
      .pattern(/^[a-f0-9]{24}$/)
      .messages({ 'string.pattern.base': '"party" must be a valid ID' }),
  });

  return schema.validate(data);
};

const validateContestantUpdate = data => {
  const schema = Joi.object({
    stateOfOrigin: Joi.string().trim().max(30),
    gender: Joi.string().equal('MALE', 'FEMALE'),
    lastName: Joi.string().trim().min(2).max(64),
    firstName: Joi.string().trim().min(2).max(64),
    middleName: Joi.string().trim().min(2).max(64).allow(''),
    party: Joi.string()
      .pattern(/^[a-f0-9]{24}$/)
      .messages({ 'string.pattern.base': '"party" must be a valid ID' }),
  })
    .min(1)
    .messages({
      'object.min': 'At least {{#limit}} field must be provided.',
    });

  return schema.validate(data);
};

const validateGetContestants = data => {
  const schema = Joi.object({
    ...paginationFields,
    lastName: Joi.string(),
    firstName: Joi.string(),
    sortBy: Joi.string().trim(),
    gender: Joi.string().equal('MALE', 'FEMALE'),
    party: Joi.string()
      .pattern(/^[a-f0-9]{24}$/)
      .messages({ 'string.pattern.base': '"party" must be a valid ID' }),
  });

  return schema.validate(data);
};

const validateGetElections = data => {
  const schema = Joi.object({
    ...paginationFields,
    endTime: Joi.date(),
    startTime: Joi.date(),
    sortBy: Joi.string().trim(),
    delimitationCode: Joi.string().allow(''),
  });

  return schema.validate(data);
};

const validateGetUserElections = data => {
  const schema = Joi.object({
    ...paginationFields,
    endTime: Joi.date(),
    startTime: Joi.date(),
    sortBy: Joi.string().trim(),
  });

  return schema.validate(data);
};

const validateGetUserForms = data => {
  const schema = Joi.object({
    ...paginationFields,
    name: Joi.string(),
    endTime: Joi.date(),
    startTime: Joi.date(),
    visibility: Joi.boolean(),
    sortBy: Joi.string().trim(),
    identityCheck: Joi.boolean(),
  });

  return schema.validate(data);
};

const validateGetForms = data => {
  const schema = Joi.object({
    ...paginationFields,
    name: Joi.string(),
    endTime: Joi.date(),
    startTime: Joi.date(),
    sortBy: Joi.string().trim(),
  });

  return schema.validate(data);
};

const validateGetPolls = data => {
  const schema = Joi.object({
    ...paginationFields,
    sortBy: Joi.string().trim(),
    optionsImageEnabled: Joi.boolean(),
  });

  return schema.validate(data);
};

const validateParty = data => {
  const schema = Joi.object({
    motto: Joi.string().max(256).allow(''),
    shortName: Joi.string().trim().max(10).uppercase().required(),
    longName: Joi.string().trim().max(128).uppercase().required(),
  });

  return schema.validate(data);
};

const validatePartyUpdate = data => {
  const schema = Joi.object({
    motto: Joi.string().max(256).allow(''),
    shortName: Joi.string().trim().max(10).uppercase(),
    longName: Joi.string().trim().max(128).uppercase(),
  })
    .min(1)
    .messages({
      'object.min': 'At least {{#limit}} field must be provided.',
    });

  return schema.validate(data);
};

const validateGetParties = data => {
  const schema = Joi.object({
    sortBy: Joi.string().trim(),
    page: Joi.number().integer().positive(),
    limit: Joi.number().integer().equal(10, 25, 50),
  });

  return schema.validate(data);
};

module.exports = {
  validateForm,
  validatePoll,
  validateParty,
  validateGetPolls,
  validateElection,
  validateGetForms,
  validatePollUpdate,
  validateFormUpdate,
  validateGetParties,
  validateContestant,
  validatePartyUpdate,
  validateGetElections,
  validateGetUserForms,
  validateGetContestants,
  validateElectionUpdate,
  validateGetUserElections,
  validateContestantUpdate,
  validateElectionContestant,
};
