const SHA256 = require('crypto-js/sha256');
const encryption = require('mongoose-encryption');
const { Schema, model, Types } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const { SUB_DOC_OPTIONS } = require('../constants');
const { sortObject } = require('../utils/index.utils');

const PollVote = new Schema(
  {
    optionIDs: { type: [String], required: true },
    pollID: { type: Types.ObjectId, ref: 'Poll', required: true },
  },
  SUB_DOC_OPTIONS
);

const VoteData = new Schema(
  {
    pollVotes: [PollVote],
    form: { type: Types.ObjectId, ref: 'Form', required: true },
  },
  SUB_DOC_OPTIONS
);

const FormVoteSchema = new Schema(
  {
    isInvalid: { type: Boolean },
    isTailNode: { type: Boolean, required: true },
    hash: { type: String, required: true, immutable: true },
    data: { type: VoteData, required: true, immutable: true },
    form: { type: Types.ObjectId, ref: 'Form', required: true },
    timestamp: { type: Number, required: true, immutable: true },
    previousHash: { type: String, default: '', immutable: true },
    index: { type: Number, required: true, min: 0, immutable: true },
  },
  { minimize: false, collection: 'formVotes' }
);
FormVoteSchema.plugin(mongoosePaginate);
FormVoteSchema.plugin(encryption, {
  secret: process.env.MONGO_DB_SECRET,
  excludeFromEncryption: ['form', 'isTailNode'],
});

/**
 * Checks if user's vote is still valid by checking if vote has been tampered with
 * @param {object} previousVote - the vote just before this vote in a vote blockchain
 * @returns {boolean}
 */
FormVoteSchema.methods.isValid = function (previousVote) {
  const normalizedData = sortObject(JSON.parse(JSON.stringify(this.data)));
  const voteHash = SHA256(
    this.index + this.previousHash + this.timestamp + JSON.stringify(normalizedData)
  ).toString();

  if (!this.form.equals(this.data.form)) {
    return false;
  } else if (this.hash !== voteHash) {
    return false;
  } else if (previousVote && previousVote.hash !== this.previousHash) {
    return false;
  }
  return true;
};

/* Before returning json response to client, remove sensitive fields */
FormVoteSchema.methods.toJSON = function () {
  const vote = this.toObject();
  delete vote.data;
  delete vote.form;
  delete vote.isTailNode;
  delete vote.previousHash;
  return vote;
};

const FormVote = model('FormVote', FormVoteSchema);
module.exports = FormVote;
