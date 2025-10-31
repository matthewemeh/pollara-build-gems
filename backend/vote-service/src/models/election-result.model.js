const { Schema, model, Types } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const { SUB_DOC_OPTIONS } = require('../constants');

const ResultsSchema = new Schema(
  {
    votes: { type: Number, min: 0, default: 0 },
    party: { type: Types.ObjectId, ref: 'Party', required: true },
    contestants: [{ type: Types.ObjectId, ref: 'Contestant', required: true }],
  },
  SUB_DOC_OPTIONS
);

const ElectionResultSchema = new Schema(
  {
    results: [ResultsSchema],
    election: { type: Types.ObjectId, ref: 'Election', unique: true, required: true },
  },
  { id: false, minimize: false, timestamps: true, collection: 'electionResults' }
);
ElectionResultSchema.plugin(mongoosePaginate);

const ElectionResult = model('ElectionResult', ElectionResultSchema);
module.exports = ElectionResult;
