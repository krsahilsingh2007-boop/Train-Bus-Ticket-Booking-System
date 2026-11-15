const mongoose = require('mongoose');

const trainSchema = new mongoose.Schema(
  {
    trainNumber: {
      type: String,
      required: [true, 'Please provide train number'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    trainName: {
      type: String,
      required: [true, 'Please provide train name'],
      trim: true,
    },
    trainType: {
      type: String,
      enum: ['Rajdhani Express', 'Shatabdi Express', 'Superfast Express', 'Vande Bharat Express', 'Mail/Express'],
      default: 'Superfast Express',
    },
    totalCoaches: {
      type: Number,
      default: 16,
    },
    classesSupported: [
      {
        type: String,
        enum: ['1AC', '2AC', '3AC', 'CC', 'SL'],
        required: true,
      },
    ],
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Train', trainSchema);
