const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  downloadTicketPDF,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/:id', getBookingById);
router.post('/:id/cancel', protect, cancelBooking);
router.get('/:id/ticket-pdf', downloadTicketPDF);

module.exports = router;
