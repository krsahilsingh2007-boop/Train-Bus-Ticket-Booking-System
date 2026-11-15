const SeatInventory = require('../models/SeatInventory');
const Schedule = require('../models/Schedule');

// @desc    Get interactive seat layout for a schedule with live availability
// @route   GET /api/seats/:scheduleId
// @access  Public
const getSeatLayout = async (req, res, next) => {
  try {
    const { scheduleId } = req.params;

    const schedule = await Schedule.findById(scheduleId)
      .populate('train')
      .populate('bus')
      .populate('route');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Journey schedule not found',
      });
    }

    let inventory = await SeatInventory.findOne({ schedule: scheduleId });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Seat inventory not initialized for this schedule',
      });
    }

    // Auto-release expired holds (older than 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    let inventoryModified = false;

    inventory.seats.forEach((seat) => {
      if (seat.status === 'reserved' && seat.reservedAt && seat.reservedAt < tenMinutesAgo) {
        seat.status = 'available';
        seat.reservedBy = null;
        seat.reservedAt = null;
        inventoryModified = true;
      }
    });

    if (inventoryModified) {
      inventory.availableCount = inventory.seats.filter((s) => s.status === 'available').length;
      await inventory.save();
    }

    // Group seats for intuitive frontend rendering (Train coach / Bus deck layout)
    const decks = {};
    inventory.seats.forEach((seat) => {
      const section = seat.coachOrDeck || 'General';
      if (!decks[section]) {
        decks[section] = [];
      }
      decks[section].push({
        seatNumber: seat.seatNumber,
        seatClass: seat.seatClass,
        berthType: seat.berthType,
        price: seat.price,
        status: seat.status,
        isMyReservation: req.user ? seat.reservedBy?.toString() === req.user.id : false,
      });
    });

    res.status(200).json({
      success: true,
      scheduleId: schedule._id,
      serviceType: schedule.serviceType,
      title: schedule.serviceType === 'train' ? schedule.train?.trainName : schedule.bus?.operatorName,
      number: schedule.serviceType === 'train' ? schedule.train?.trainNumber : schedule.bus?.busNumber,
      currency: 'INR',
      symbol: '₹',
      totalSeats: inventory.totalSeats,
      availableCount: inventory.availableCount,
      decks,
      seats: inventory.seats.map((s) => ({
        seatNumber: s.seatNumber,
        coachOrDeck: s.coachOrDeck,
        seatClass: s.seatClass,
        berthType: s.berthType,
        price: s.price,
        status: s.status,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Atomically hold / reserve selected seats (Prevents double booking)
// @route   POST /api/seats/reserve
// @access  Private (Bearer token)
const reserveSeats = async (req, res, next) => {
  try {
    const { scheduleId, seatNumbers } = req.body;

    if (!scheduleId || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide scheduleId and a list of seatNumbers to reserve',
      });
    }

    if (seatNumbers.length > 6) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 6 seats can be reserved in a single transaction',
      });
    }

    const inventory = await SeatInventory.findOne({ schedule: scheduleId });
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Seat inventory not found for schedule',
      });
    }

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const now = new Date();

    // Check all requested seats for conflict
    for (const seatNum of seatNumbers) {
      const seat = inventory.seats.find((s) => s.seatNumber === seatNum);
      if (!seat) {
        return res.status(400).json({
          success: false,
          message: `Seat ${seatNum} is not part of this journey layout`,
        });
      }

      const isHoldExpired = seat.status === 'reserved' && seat.reservedAt && seat.reservedAt < tenMinutesAgo;
      const isAlreadyHeldByMe = seat.status === 'reserved' && seat.reservedBy?.toString() === req.user.id;

      if (seat.status === 'booked') {
        return res.status(409).json({
          success: false,
          message: `Seat ${seatNum} has already been booked by another passenger`,
        });
      }

      if (seat.status === 'reserved' && !isHoldExpired && !isAlreadyHeldByMe) {
        return res.status(409).json({
          success: false,
          message: `Seat ${seatNum} is currently held by another passenger. Please select another seat.`,
        });
      }
    }

    // Apply temporary lock
    inventory.seats.forEach((seat) => {
      if (seatNumbers.includes(seat.seatNumber)) {
        seat.status = 'reserved';
        seat.reservedBy = req.user.id;
        seat.reservedAt = now;
      }
    });

    inventory.availableCount = inventory.seats.filter((s) => s.status === 'available').length;
    await inventory.save();

    res.status(200).json({
      success: true,
      message: `${seatNumbers.length} seat(s) held successfully for 10 minutes`,
      reservedSeats: seatNumbers,
      holdExpiresAt: new Date(now.getTime() + 10 * 60 * 1000),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSeatLayout,
  reserveSeats,
};
