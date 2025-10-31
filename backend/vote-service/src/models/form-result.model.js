const { Schema, model, Types } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const { SUB_DOC_OPTIONS } = require('../constants');

const OptionSchema = new Schema(
  {
    optionID: { type: String, required: true },
    votes: { type: Number, min: 0, default: 0 },
  },
  SUB_DOC_OPTIONS
);

const ResultsSchema = new Schema(
  {
    options: [OptionSchema],
    poll: { type: Types.ObjectId, ref: 'Poll', required: true },
  },
  SUB_DOC_OPTIONS
);

const FormResultSchema = new Schema(
  {
    results: [ResultsSchema],
    form: { type: Types.ObjectId, ref: 'Form', required: true },
  },
  { id: false, minimize: false, timestamps: true, collection: 'formResults' }
);
FormResultSchema.plugin(mongoosePaginate);

const FormResult = model('FormResult', FormResultSchema);
module.exports = FormResult;
