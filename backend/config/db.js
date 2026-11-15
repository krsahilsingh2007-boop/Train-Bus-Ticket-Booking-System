const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ticket_booking';

  try {
    console.log(`[Database] Attempting connection to MongoDB at: ${primaryUri}`);
    await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 3000,
      autoIndex: true,
    });
    console.log(`[Database] Connected successfully to primary MongoDB at ${primaryUri}`);
  } catch (primaryErr) {
    console.warn(`[Database] Primary MongoDB connection failed (${primaryErr.message}).`);
    console.log('[Database] Initiating embedded MongoMemoryServer fallback for seamless local execution...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create({
        instance: {
          dbName: 'ticket_booking',
        },
      });
      const fallbackUri = mongodInstance.getUri();
      console.log(`[Database] Embedded MongoMemoryServer active at: ${fallbackUri}`);

      await mongoose.connect(fallbackUri, {
        autoIndex: true,
      });
      console.log('[Database] Connected to in-memory MongoDB fallback. Ready for operations.');
    } catch (fallbackErr) {
      console.error('[Database] Fatal: Unable to connect to either primary or fallback MongoDB', fallbackErr);
      process.exit(1);
    }
  }

  // Automatic seed check: If database is empty, seed initial schedules and trains/buses
  try {
    const Schedule = require('../models/Schedule');
    const scheduleCount = await Schedule.countDocuments();
    if (scheduleCount === 0) {
      console.log('[Database] Empty database detected. Auto-seeding initial routes, trains, buses, and schedules in INR (₹)...');
      const seedData = require('../utils/seed');
      await seedData();
      console.log('[Database] Initial seed data loaded successfully.');
    } else {
      console.log(`[Database] Database already populated with ${scheduleCount} active schedules.`);
    }
  } catch (seedErr) {
    console.error('[Database] Seed check warning:', seedErr.message);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};

module.exports = { connectDB, disconnectDB };
