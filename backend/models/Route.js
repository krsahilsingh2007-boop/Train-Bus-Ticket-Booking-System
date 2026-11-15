const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: [true, 'Please provide origin station / city'],
      trim: true,
      index: true,
    },
    destination: {
      type: String,
      required: [true, 'Please provide destination station / city'],
      trim: true,
      index: true,
    },
    distanceKm: {
      type: Number,
      required: true,
      min: 1,
    },
    estimatedDuration: {
      type: String,
      required: true, // e.g. '15h 30m'
      trim: true,
    },
    serviceType: {
      type: String,
      enum: ['train', 'bus'],
      required: true,
      index: true,
    },
    stops: [
      {
        stopName: { type: String, required: true },
        stopOrder: { type: Number, required: true },
        haltDuration: { type: String, default: '5 mins' },
        distanceFromSourceKm: { type: Number, default: 0 },
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

// Compound index for high performance searching
routeSchema.index({ source: 1, destination: 1, serviceType: 1 });

module.exports = mongoose.model('Route', routeSchema);
