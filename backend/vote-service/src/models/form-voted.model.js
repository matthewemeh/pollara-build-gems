const { Schema, model, Types } = require('mongoose');

const FormVotedSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: 'User', required: true, immutable: true },
    form: { type: Types.ObjectId, ref: 'Form', required: true, immutable: true },
  },
  { minimize: false, timestamps: true, collection: 'formsVoted' }
);

FormVotedSchema.index({ user: 1, form: 1 }, { unique: true });

const FormVoted = model('FormVoted', FormVotedSchema);
module.exports = FormVoted;
