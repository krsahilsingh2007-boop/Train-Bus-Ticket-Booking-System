const PDFDocument = require('pdfkit');
const Booking = require('../models/Booking');
const Schedule = require('../models/Schedule');
const SeatInventory = require('../models/SeatInventory');
const Payment = require('../models/Payment');
const Cancellation = require('../models/Cancellation');
const { generatePNR, generateBookingId, generateTxnId } = require('../utils/pnrGenerator');
const { calculateFare } = require('../services/fareService');

// @desc    Complete checkout, confirm booking, lock seats, and generate PNR
// @route   POST /api/bookings
// @access  Private (Bearer token)
const createBooking = async (req, res, next) => {
  try {
    const { scheduleId, passengers, paymentMethod = 'UPI' } = req.body;

    if (!scheduleId || !Array.isArray(passengers) || passengers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide scheduleId and passenger information',
      });
    }

    const schedule = await Schedule.findById(scheduleId)
      .populate('train')
      .populate('bus')
      .populate('route');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found',
      });
    }

    const inventory = await SeatInventory.findOne({ schedule: scheduleId });
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Seat inventory not found',
      });
    }

    const seatNumbers = passengers.map((p) => p.seatNumber);
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    // Verify seat availability or user hold
    for (const seatNum of seatNumbers) {
      const seat = inventory.seats.find((s) => s.seatNumber === seatNum);
      if (!seat) {
        return res.status(400).json({
          success: false,
          message: `Seat ${seatNum} does not exist in this journey`,
        });
      }

      if (seat.status === 'booked') {
        return res.status(409).json({
          success: false,
          message: `Seat ${seatNum} is already booked`,
        });
      }

      const isHoldExpired = seat.status === 'reserved' && seat.reservedAt && seat.reservedAt < tenMinutesAgo;
      const isHeldByMe = seat.status === 'reserved' && seat.reservedBy?.toString() === req.user.id;

      if (seat.status === 'reserved' && !isHoldExpired && !isHeldByMe) {
        return res.status(409).json({
          success: false,
          message: `Seat ${seatNum} is held by another passenger`,
        });
      }
    }

    // Calculate verified fare in INR (₹)
    const seatsForFare = passengers.map((p) => {
      const seatDoc = inventory.seats.find((s) => s.seatNumber === p.seatNumber);
      return {
        seatNumber: p.seatNumber,
        seatClass: p.seatClass || seatDoc?.seatClass || 'Standard',
        price: seatDoc?.price,
      };
    });

    const fareSummary = calculateFare(seatsForFare, schedule.fares);

    // Map passenger fares
    const enrichedPassengers = passengers.map((p, idx) => ({
      name: (p.name || p.fullName || 'Passenger').trim(),
      age: Number(p.age) || 25,
      gender: p.gender || 'Other',
      seatNumber: p.seatNumber,
      seatClass: p.seatClass || 'Standard',
      fare: fareSummary.seatBreakdown[idx]?.price || 500,
    }));

    const pnr = generatePNR();
    const bookingId = generateBookingId();
    const txnRef = generateTxnId();

    // Create Payment record (simulated)
    const payment = await Payment.create({
      paymentId: `PAY-${pnr}`,
      user: req.user.id,
      amount: fareSummary.totalFare,
      currency: 'INR',
      paymentMethod,
      status: 'SUCCESS',
      transactionRef: txnRef,
      simulationNote: 'Simulated payment in test environment',
    });

    // Create Booking
    const booking = await Booking.create({
      bookingId,
      pnr,
      user: req.user.id,
      schedule: schedule._id,
      serviceType: schedule.serviceType,
      passengers: enrichedPassengers,
      totalFare: fareSummary.totalFare,
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'COMPLETED',
      payment: payment._id,
      journeyDate: schedule.journeyDate,
    });

    payment.booking = booking._id;
    await payment.save();

    // Mark seats as permanently booked in inventory
    inventory.seats.forEach((seat) => {
      if (seatNumbers.includes(seat.seatNumber)) {
        seat.status = 'booked';
        seat.reservedBy = req.user.id;
        seat.bookingId = booking._id;
      }
    });

    inventory.availableCount = inventory.seats.filter((s) => s.status === 'available').length;
    await inventory.save();

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking: {
        id: booking._id,
        bookingId: booking.bookingId,
        pnr: booking.pnr,
        serviceType: booking.serviceType,
        totalFare: booking.totalFare,
        currency: 'INR',
        symbol: '₹',
        fareBreakdown: fareSummary,
        journeyDate: booking.journeyDate,
        passengers: booking.passengers,
        status: booking.bookingStatus,
        paymentStatus: booking.paymentStatus,
        transactionRef: txnRef,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings for the logged-in customer
// @route   GET /api/bookings/my-bookings
// @access  Private (Bearer token)
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate({
        path: 'schedule',
        populate: [
          { path: 'train' },
          { path: 'bus' },
          { path: 'route' },
        ],
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking by ID or PNR
// @route   GET /api/bookings/:id
// @access  Public
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if searching by PNR or ObjectId
    const isPNR = id.length <= 10 && !id.match(/^[0-9a-fA-F]{24}$/);
    const query = isPNR ? { pnr: id.toUpperCase() } : { _id: id };

    const booking = await Booking.findOne(query)
      .populate({
        path: 'schedule',
        populate: [
          { path: 'train' },
          { path: 'bus' },
          { path: 'route' },
        ],
      })
      .populate('payment');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking not found with reference: ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking, release seat inventory, and compute INR refund
// @route   POST /api/bookings/:id/cancel
// @access  Private (Bearer token)
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Authorization check
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this booking',
      });
    }

    if (booking.bookingStatus === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been cancelled',
      });
    }

    // IRCTC / RedBus standard cancellation charges in INR
    const cancellationChargePerSeat = booking.serviceType === 'train' ? 120 : 80;
    const totalCancellationCharges = cancellationChargePerSeat * booking.passengers.length;
    const refundAmount = Math.max(0, booking.totalFare - totalCancellationCharges);

    const cancelledSeats = booking.passengers.map((p) => p.seatNumber);

    // Release seats in inventory
    const inventory = await SeatInventory.findOne({ schedule: booking.schedule });
    if (inventory) {
      inventory.seats.forEach((seat) => {
        if (cancelledSeats.includes(seat.seatNumber)) {
          seat.status = 'available';
          seat.reservedBy = null;
          seat.reservedAt = null;
          seat.bookingId = null;
        }
      });
      inventory.availableCount = inventory.seats.filter((s) => s.status === 'available').length;
      await inventory.save();
    }

    // Update booking status
    booking.bookingStatus = 'CANCELLED';
    booking.paymentStatus = 'REFUNDED';
    await booking.save();

    // Create Cancellation record
    const cancellation = await Cancellation.create({
      cancellationId: `CNL-${booking.pnr}`,
      booking: booking._id,
      user: req.user.id,
      pnr: booking.pnr,
      cancelledSeats,
      originalFare: booking.totalFare,
      cancellationCharges: totalCancellationCharges,
      refundAmount,
      reason: req.body.reason || 'Customer requested ticket cancellation',
      status: 'PROCESSED',
    });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Seats have been restored to inventory.',
      cancellation: {
        cancellationId: cancellation.cancellationId,
        pnr: cancellation.pnr,
        originalFare: `₹${cancellation.originalFare}`,
        cancellationCharges: `₹${cancellation.cancellationCharges}`,
        refundAmount: `₹${cancellation.refundAmount}`,
        cancelledSeats: cancellation.cancelledSeats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate and download authentic PDF e-Ticket / Boarding Pass in INR
// @route   GET /api/bookings/:id/ticket-pdf
const downloadTicketPDF = async (req, res, next) => {
  try {
    const id = req.params.id;
    const isPNR = id.length <= 10 && !id.match(/^[0-9a-fA-F]{24}$/);
    const query = isPNR ? { pnr: id.toUpperCase() } : { _id: id };

    const booking = await Booking.findOne(query)
      .populate({
        path: 'schedule',
        populate: [
          { path: 'train' },
          { path: 'bus' },
          { path: 'route' },
        ],
      })
      .populate('user');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    // Set HTTP response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=RailBus_Ticket_${booking.pnr}.pdf`
    );

    doc.pipe(res);

    // ==========================================
    // PDF DESIGN IN RAILBUS 4-COLOR IDENTITY
    // ==========================================

    // Header Background banner (Deep Teal #407778)
    doc
      .rect(40, 40, 515, 70)
      .fill('#407778');

    // Brand Name
    doc
      .fillColor('#FFFFFF')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('RailBus Electronic Reservation Slip (ERS)', 55, 52);

    doc
      .fillColor('#F7E1C9')
      .fontSize(10)
      .font('Helvetica')
      .text('Official National Transit Boarding Pass & Valid Travel Document', 55, 80);

    // PNR & Booking ID Box (Soft Peach #F7E1C9)
    doc
      .rect(40, 120, 515, 60)
      .fill('#F7E1C9');

    doc
      .fillColor('#407778')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('PNR NUMBER', 55, 132)
      .fontSize(18)
      .text(booking.pnr, 55, 148);

    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('BOOKING ID', 220, 132)
      .fontSize(12)
      .font('Helvetica')
      .fillColor('#1D3536')
      .text(booking.bookingId, 220, 150);

    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#407778')
      .text('BOOKING STATUS', 390, 132)
      .fontSize(14)
      .fillColor(booking.bookingStatus === 'CONFIRMED' ? '#2E7D32' : '#C62828')
      .text(booking.bookingStatus, 390, 148);

    // Journey Details
    doc
      .fillColor('#407778')
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Journey & Vehicle Details', 40, 200);

    const vehicleTitle =
      booking.serviceType === 'train'
        ? `${booking.schedule?.train?.trainName} (${booking.schedule?.train?.trainNumber})`
        : `${booking.schedule?.bus?.operatorName} (${booking.schedule?.bus?.busNumber})`;

    doc
      .rect(40, 220, 515, 80)
      .strokeColor('#65AFB0')
      .lineWidth(1)
      .stroke();

    doc
      .fillColor('#1D3536')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Service Type:', 55, 235)
      .font('Helvetica')
      .text(booking.serviceType.toUpperCase(), 140, 235);

    doc
      .font('Helvetica-Bold')
      .text('Service Name:', 55, 255)
      .font('Helvetica')
      .text(vehicleTitle, 140, 255);

    doc
      .font('Helvetica-Bold')
      .text('From (Origin):', 55, 275)
      .font('Helvetica')
      .text(`${booking.schedule?.route?.source} (${booking.schedule?.departureTime})`, 140, 275);

    doc
      .font('Helvetica-Bold')
      .text('Journey Date:', 330, 235)
      .font('Helvetica')
      .text(booking.journeyDate, 420, 235);

    doc
      .font('Helvetica-Bold')
      .text('To (Dest):', 330, 275)
      .font('Helvetica')
      .text(`${booking.schedule?.route?.destination} (${booking.schedule?.arrivalTime})`, 420, 275);

    // Passenger Manifest
    doc
      .fillColor('#407778')
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Passenger Manifest', 40, 320);

    // Table Header
    doc
      .rect(40, 340, 515, 25)
      .fill('#407778');

    doc
      .fillColor('#FFFFFF')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('#', 55, 348)
      .text('Passenger Name', 85, 348)
      .text('Age / Gender', 250, 348)
      .text('Seat Number', 360, 348)
      .text('Fare', 460, 348);

    let currentY = 370;
    booking.passengers.forEach((p, index) => {
      // Row background
      if (index % 2 === 0) {
        doc.rect(40, currentY - 5, 515, 22).fill('#FBF0E6');
      }

      doc
        .fillColor('#1D3536')
        .fontSize(10)
        .font('Helvetica')
        .text(String(index + 1), 55, currentY)
        .text(p.name, 85, currentY)
        .text(`${p.age} / ${p.gender}`, 250, currentY)
        .text(`${p.seatNumber} (${p.seatClass})`, 360, currentY)
        .text(`Rs. ${p.fare}`, 460, currentY);

      currentY += 24;
    });

    // Total Fare Box
    currentY += 15;
    doc
      .rect(40, currentY, 515, 50)
      .fill('#F7E1C9');

    doc
      .fillColor('#407778')
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Total Fare Paid (Inclusive of GST & Platform Fee):', 55, currentY + 18)
      .fontSize(16)
      .text(`INR Rs. ${booking.totalFare}.00`, 370, currentY + 16);

    // Instructions & Footer
    currentY += 70;
    doc
      .fillColor('#526D6E')
      .fontSize(9)
      .font('Helvetica')
      .text('Instructions & Mandatory Carriage Terms:', 40, currentY)
      .text('1. Please carry a valid original Government Photo Identity Card (Aadhaar, Passport, Driving License, Voter ID).', 40, currentY + 15)
      .text('2. Arrive at the boarding point at least 30 minutes prior to departure.', 40, currentY + 28)
      .text('3. For cancellations, access My Bookings on the RailBus portal prior to scheduled departure.', 40, currentY + 41)
      .text('4. This is a computer generated boarding pass verified by RailBus Enterprise Ticketing Engine.', 40, currentY + 54);

    doc.end();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  downloadTicketPDF,
};
