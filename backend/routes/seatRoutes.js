const express = require('express');
const router = express.Router();
const { getSeatLayout, reserveSeats } = require('../controllers/seatController');
const { protect } = require('../middleware/auth');

router.get('/:scheduleId', getSeatLayout);
router.post('/reserve', protect, reserveSeats);

module.exports = router;
