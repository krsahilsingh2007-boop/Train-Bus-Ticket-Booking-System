const mongoose = require('mongoose');

const busSchema = new mongoose.Schema(
  {
    busNumber: {
      type: String,
      required: [true, 'Please provide vehicle registration number'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    operatorName: {
      type: String,
      required: [true, 'Please provide bus operator name'],
      trim: true,
    },
    busType: {
      type: String,
      enum: [
        'Volvo Multi-Axle AC Sleeper',
        'Scania Luxury AC Seater',
        'Mercedes-Benz Glider',
        'BharatBenz Semi-Sleeper',
        'Non-AC Deluxe Seater'
      ],
      default: 'Volvo Multi-Axle AC Sleeper',
    },
    totalSeats: {
      type: Number,
      required: true,
      default: 36,
    },
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

module.exports = mongoose.model('Bus', busSchema);
