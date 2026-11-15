const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllTrains,
  createTrain,
  updateTrain,
  deleteTrain,
  getAllBuses,
  createBus,
  updateBus,
  deleteBus,
  getAllSchedules,
  getAllBookings,
  getAllUsers,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Protect all admin routes with JWT and Admin role guard
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);

// Train management
router.route('/trains').get(getAllTrains).post(createTrain);
router.route('/trains/:id').put(updateTrain).delete(deleteTrain);

// Bus management
router.route('/buses').get(getAllBuses).post(createBus);
router.route('/buses/:id').put(updateBus).delete(deleteBus);

// Schedules
router.get('/schedules', getAllSchedules);

// Bookings & Users
router.get('/bookings', getAllBookings);
router.get('/users', getAllUsers);

module.exports = router;
