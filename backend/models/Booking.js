const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 1,
      max: 120,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    seatNumber: {
      type: String,
      required: true,
    },
    seatClass: {
      type: String,
      default: 'Standard',
    },
    fare: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    pnr: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Schedule',
      required: true,
    },
    serviceType: {
      type: String,
      enum: ['train', 'bus'],
      required: true,
    },
    passengers: [passengerSchema],
    totalFare: {
      type: Number,
      required: true,
      min: 0,
    },
    bookingStatus: {
      type: String,
      enum: ['CONFIRMED', 'CANCELLED', 'PENDING'],
      default: 'CONFIRMED',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['COMPLETED', 'PENDING', 'FAILED', 'REFUNDED'],
      default: 'COMPLETED',
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
    journeyDate: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
