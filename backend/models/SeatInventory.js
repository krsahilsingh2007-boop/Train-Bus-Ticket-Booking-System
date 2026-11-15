const mongoose = require('mongoose');

const seatItemSchema = new mongoose.Schema(
  {
    seatNumber: {
      type: String,
      required: true,
      trim: true,
    },
    coachOrDeck: {
      type: String,
      default: 'General',
    },
    seatClass: {
      type: String,
      required: true, // '1AC', '2AC', '3AC', 'SL', 'Sleeper', 'Seater'
    },
    berthType: {
      type: String,
      enum: ['Window', 'Aisle', 'Lower Berth', 'Middle Berth', 'Upper Berth', 'Side Lower', 'Side Upper'],
      default: 'Aisle',
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'booked'],
      default: 'available',
      index: true,
    },
    reservedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reservedAt: {
      type: Date,
      default: null,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
  },
  { _id: false }
);

const seatInventorySchema = new mongoose.Schema(
  {
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Schedule',
      required: true,
      unique: true,
      index: true,
    },
    totalSeats: {
      type: Number,
      required: true,
    },
    availableCount: {
      type: Number,
      required: true,
    },
    seats: [seatItemSchema],
  },
  {
    timestamps: true,
  }
);

// Concurrency-safe helper method to reserve seats atomically
seatInventorySchema.statics.reserveSeatsAtomically = async function (scheduleId, seatNumbers, userId, reservationTimeoutMinutes = 10) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const inventory = await this.findOne({ schedule: scheduleId }).session(session);
    if (!inventory) {
      throw new Error('Seat inventory not found for schedule');
    }

    const now = new Date();
    const expiryThreshold = new Date(now.getTime() - reservationTimeoutMinutes * 60 * 1000);

    // Check availability and update in memory within transaction
    for (const seatNum of seatNumbers) {
      const seat = inventory.seats.find((s) => s.seatNumber === seatNum);
      if (!seat) {
        throw new Error(`Seat ${seatNum} does not exist in inventory`);
      }

      // Check if seat is currently available, or previously reserved but expired
      const isExpired = seat.status === 'reserved' && seat.reservedAt && seat.reservedAt < expiryThreshold;
      if (seat.status === 'booked' || (seat.status === 'reserved' && !isExpired && seat.reservedBy?.toString() !== userId.toString())) {
        throw new Error(`Seat ${seatNum} is already ${seat.status}`);
      }

      // Lock seat
      seat.status = 'reserved';
      seat.reservedBy = userId;
      seat.reservedAt = now;
    }

    // Recalculate available count
    inventory.availableCount = inventory.seats.filter((s) => s.status === 'available').length;
    await inventory.save({ session });

    await session.commitTransaction();
    session.endSession();
    return { success: true, seatNumbers };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

module.exports = mongoose.model('SeatInventory', seatInventorySchema);
