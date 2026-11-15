const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    paymentMethod: {
      type: String,
      enum: ['CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING', 'WALLET'],
      default: 'CREDIT_CARD',
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'PENDING', 'REFUNDED'],
      default: 'SUCCESS',
      index: true,
    },
    transactionRef: {
      type: String,
      required: true,
    },
    simulationNote: {
      type: String,
      default: 'Demonstration payment in sandbox mode',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
