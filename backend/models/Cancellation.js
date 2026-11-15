const mongoose = require('mongoose');

const cancellationSchema = new mongoose.Schema(
  {
    cancellationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pnr: {
      type: String,
      required: true,
    },
    cancelledSeats: [
      {
        type: String,
        required: true,
      },
    ],
    originalFare: {
      type: Number,
      required: true,
    },
    cancellationCharges: {
      type: Number,
      required: true,
      default: 0,
    },
    refundAmount: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      default: 'Customer requested cancellation',
    },
    status: {
      type: String,
      enum: ['PROCESSED', 'PENDING', 'REJECTED'],
      default: 'PROCESSED',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Cancellation', cancellationSchema);
