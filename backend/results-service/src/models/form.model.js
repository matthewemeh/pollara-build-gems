const { Schema, model, Types } = require('mongoose');

const { VISIBILITY } = require('../constants');

const FormSchema = new Schema(
  {
    name: { type: String, required: true },
    identityCheck: { type: Boolean, default: true },
    author: { type: Types.ObjectId, ref: 'User', immutable: true, required: true },
    visibility: {
      type: String,
      uppercase: true,
      default: VISIBILITY.PRIVATE,
      enum: Object.values(VISIBILITY),
    },
    endTime: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > this.startTime;
        },
        message: 'End Time should not be earlier than Start Time',
      },
    },
    startTime: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value < this.endTime;
        },
        message: 'Start Time should not be later than End Time',
      },
    },
  },
  { minimize: false, timestamps: true, collection: 'forms' }
);

const Form = model('Form', FormSchema);
module.exports = Form;
