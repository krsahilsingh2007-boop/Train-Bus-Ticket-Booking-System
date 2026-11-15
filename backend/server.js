const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const trainRoutes = require('./routes/trainRoutes');
const busRoutes = require('./routes/busRoutes');
const seatRoutes = require('./routes/seatRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Load environment variables
dotenv.config();

const app = express();

// Connect to Database (auto-connects to MongoDB or memory fallback)
connectDB();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      // Allow any localhost or 127.0.0.1 port (5173, 5174, 5175, etc.)
      const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      if (isLocal || origin === process.env.CLIENT_URL) {
        return callback(null, origin);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Request rate limiter (relaxed in development/test for JMeter benchmark load testing)
const isDev = process.env.NODE_ENV !== 'production';
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 mins
  max: isDev ? 100000 : parseInt(process.env.RATE_LIMIT_MAX || '1000', 10),
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});
app.use('/api', limiter);

// Request body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'RailBus Ticketing API is online and operational',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    currency: 'INR',
    symbol: '₹',
    services: {
      railway: 'ONLINE',
      bus: 'ONLINE',
      concurrencyEngine: 'ACTIVE',
      database: 'CONNECTED',
    },
  });
});

// Root API Welcome & Endpoint Discovery
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Online Railway & Bus Ticket Booking System REST API',
    currency: 'INR (₹)',
    endpoints: {
      health: 'GET /api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile',
      },
      trains: {
        search: 'GET /api/trains/search?source=&destination=&date=',
        stations: 'GET /api/trains/stations',
        details: 'GET /api/trains/:id',
      },
      buses: {
        search: 'GET /api/buses/search?source=&destination=&date=',
        cities: 'GET /api/buses/cities',
        details: 'GET /api/buses/:id',
      },
      seats: {
        layout: 'GET /api/seats/:scheduleId',
        reserve: 'POST /api/seats/reserve',
      },
      bookings: {
        create: 'POST /api/bookings',
        myBookings: 'GET /api/bookings/my-bookings',
        details: 'GET /api/bookings/:id',
        cancel: 'POST /api/bookings/:id/cancel',
        ticketPdf: 'GET /api/bookings/:id/ticket-pdf',
      },
      payments: {
        process: 'POST /api/payments/process',
        details: 'GET /api/payments/:id',
      },
      admin: {
        dashboard: 'GET /api/admin/dashboard',
        trains: '/api/admin/trains',
        buses: '/api/admin/buses',
        schedules: '/api/admin/schedules',
        bookings: '/api/admin/bookings',
        users: '/api/admin/users',
      },
    },
  });
});

// ==========================================
// MOUNT MODULAR API ROUTES
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/trains', trainRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// 404 Route Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Endpoint not found`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` RailBus Backend API Server running on port ${PORT}`);
  console.log(` Currency Standard: INR (₹)`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Health URL:  http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[Process] Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

module.exports = app;
