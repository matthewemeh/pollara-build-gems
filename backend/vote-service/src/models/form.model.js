const { Schema, model, Types } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

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
  {
    id: false,
    minimize: false,
    timestamps: true,
    collection: 'forms',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
FormSchema.plugin(mongoosePaginate);

FormSchema.virtual('hasStarted').get(function () {
  return Date.now() >= this.startTime;
});

FormSchema.virtual('hasEnded').get(function () {
  return Date.now() >= this.endTime;
});

const Form = model('Form', FormSchema);
module.exports = Form;
