const { Schema, model, Types } = require('mongoose');

const { SUB_DOC_OPTIONS } = require('../constants');

const OptionSchema = new Schema(
  {
    imageUrl: { type: String },
    id: { type: String, required: true },
    name: { type: String, required: true },
  },
  SUB_DOC_OPTIONS
);

const PollSchema = new Schema(
  {
    index: { type: Number, required: true },
    question: { type: String, required: true },
    maxSelectableOptions: { type: Number, default: 1 },
    form: { type: Types.ObjectId, ref: 'Form', required: true },
    optionsImageEnabled: { type: Boolean, default: false, immutable: true },
    options: {
      type: [OptionSchema],
      validate: [
        {
          validator: arr => arr.length >= 2 && arr.length <= 10,
          message: 'A poll must have between 2 and 10 options',
        },
        {
          validator: arr => {
            const ids = arr.map(opt => opt.id);
            return ids.length === new Set(ids).size;
          },
          message: 'Option IDs must be unique within this poll',
        },
      ],
    },
  },
  { id: false, minimize: false, timestamps: true, collection: 'polls' }
);

const Poll = model('Poll', PollSchema);
module.exports = Poll;
