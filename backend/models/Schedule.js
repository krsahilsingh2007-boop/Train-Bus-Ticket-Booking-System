const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    serviceType: {
      type: String,
      enum: ['train', 'bus'],
      required: true,
      index: true,
    },
    train: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Train',
      default: null,
    },
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      default: null,
    },
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      required: [true, 'Schedule must reference a Route'],
      index: true,
    },
    departureTime: {
      type: String, // '16:55'
      required: true,
    },
    arrivalTime: {
      type: String, // '08:25'
      required: true,
    },
    journeyDate: {
      type: String, // 'YYYY-MM-DD' for fast indexing and date matching
      required: true,
      index: true,
    },
    fares: {
      type: Map,
      of: Number,
      required: true,
      // e.g. { '1AC': 55.00, '2AC': 40.00, '3AC': 28.00, 'SL': 15.00 } or { 'Sleeper': 22.00, 'Seater': 16.00 }
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Boarding', 'Departed', 'Delayed', 'Cancelled'],
      default: 'Scheduled',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

scheduleSchema.index({ journeyDate: 1, serviceType: 1 });

module.exports = mongoose.model('Schedule', scheduleSchema);
