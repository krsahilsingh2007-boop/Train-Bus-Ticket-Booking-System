const User = require('../models/User');
const Train = require('../models/Train');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Schedule = require('../models/Schedule');
const Booking = require('../models/Booking');
const Cancellation = require('../models/Cancellation');
const SeatInventory = require('../models/SeatInventory');

// @desc    Admin Dashboard Metrics & Statistics in INR
// @route   GET /api/admin/dashboard
// @access  Private (Admin role)
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalTrains,
      totalBuses,
      totalRoutes,
      totalBookings,
      totalCancellations,
      recentBookings,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Train.countDocuments({ isActive: true }),
      Bus.countDocuments({ isActive: true }),
      Route.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Cancellation.countDocuments(),
      Booking.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(6),
    ]);

    // Aggregate confirmed revenue in INR
    const revenueAggregate = await Booking.aggregate([
      { $match: { bookingStatus: 'CONFIRMED' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalFare' } } },
    ]);

    const totalRevenue = revenueAggregate[0]?.totalRevenue || 0;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalTrains,
        totalBuses,
        totalRoutes,
        totalBookings,
        totalCancellations,
        totalRevenue,
        currency: 'INR',
        symbol: '₹',
        formattedRevenue: `₹${totalRevenue.toLocaleString('en-IN')}`,
      },
      recentBookings,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// TRAIN MANAGEMENT
// ==========================================
const getAllTrains = async (req, res, next) => {
  try {
    const trains = await Train.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: trains.length, trains });
  } catch (error) {
    next(error);
  }
};

const createTrain = async (req, res, next) => {
  try {
    const train = await Train.create(req.body);
    res.status(201).json({ success: true, message: 'Train added successfully', train });
  } catch (error) {
    next(error);
  }
};

const updateTrain = async (req, res, next) => {
  try {
    const train = await Train.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!train) return res.status(404).json({ success: false, message: 'Train not found' });
    res.status(200).json({ success: true, message: 'Train updated successfully', train });
  } catch (error) {
    next(error);
  }
};

const deleteTrain = async (req, res, next) => {
  try {
    const train = await Train.findByIdAndDelete(req.params.id);
    if (!train) return res.status(404).json({ success: false, message: 'Train not found' });
    res.status(200).json({ success: true, message: 'Train removed successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// BUS MANAGEMENT
// ==========================================
const getAllBuses = async (req, res, next) => {
  try {
    const buses = await Bus.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: buses.length, buses });
  } catch (error) {
    next(error);
  }
};

const createBus = async (req, res, next) => {
  try {
    const bus = await Bus.create(req.body);
    res.status(201).json({ success: true, message: 'Bus added successfully', bus });
  } catch (error) {
    next(error);
  }
};

const updateBus = async (req, res, next) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });
    res.status(200).json({ success: true, message: 'Bus updated successfully', bus });
  } catch (error) {
    next(error);
  }
};

const deleteBus = async (req, res, next) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);
    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });
    res.status(200).json({ success: true, message: 'Bus removed successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// SCHEDULE MANAGEMENT
// ==========================================
const getAllSchedules = async (req, res, next) => {
  try {
    const schedules = await Schedule.find()
      .populate('train')
      .populate('bus')
      .populate('route')
      .sort({ journeyDate: -1 });
    res.status(200).json({ success: true, count: schedules.length, schedules });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// BOOKINGS & USERS
// ==========================================
const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email phone')
      .populate({
        path: 'schedule',
        populate: [{ path: 'train' }, { path: 'bus' }, { path: 'route' }],
      })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
