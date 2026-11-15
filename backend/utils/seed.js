const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User');
const Train = require('../models/Train');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Schedule = require('../models/Schedule');
const SeatInventory = require('../models/SeatInventory');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const { generatePNR, generateBookingId, generateTxnId } = require('./pnrGenerator');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ticket_booking';
    console.log(`[Seeder] Connecting to MongoDB: ${mongoUri}`);

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    console.log('[Seeder] Clearing old collections for clean seed...');
    await Promise.all([
      User.deleteMany({}),
      Train.deleteMany({}),
      Bus.deleteMany({}),
      Route.deleteMany({}),
      Schedule.deleteMany({}),
      SeatInventory.deleteMany({}),
      Booking.deleteMany({}),
      Payment.deleteMany({}),
    ]);

    // ==========================================
    // 1. SEED USERS
    // ==========================================
    console.log('[Seeder] Creating admin & customer users...');

    const users = await User.create([
      {
        name: 'Chief Administrator',
        email: 'admin@railbus.com',
        password: 'Admin@123',
        role: 'admin',
        phone: '+91 98765 43210',
      },
      {
        name: 'Arjun Verma',
        email: 'customer@railbus.com',
        password: 'Customer@123',
        role: 'customer',
        phone: '+91 98111 22334',
      },
      {
        name: 'Priya Sundaram',
        email: 'priya.s@example.in',
        password: 'Customer@123',
        role: 'customer',
        phone: '+91 94440 55667',
      },
    ]);

    const adminUser = users[0];
    const customerUser = users[1];

    // ==========================================
    // 2. SEED TRAINS (IRCTC STANDARDS)
    // ==========================================
    console.log('[Seeder] Creating Indian Railway trains...');
    const trains = await Train.create([
      {
        trainNumber: '12952',
        trainName: 'Mumbai Rajdhani Superfast Express',
        trainType: 'Rajdhani Express',
        totalCoaches: 20,
        classesSupported: ['1AC', '2AC', '3AC'],
        amenities: ['Catering / Meals', 'Free WiFi', 'Clean Bedroll', 'Bio Toilets', 'Charging Sockets'],
        isActive: true,
      },
      {
        trainNumber: '12002',
        trainName: 'New Delhi Bhopal Shatabdi Express',
        trainType: 'Shatabdi Express',
        totalCoaches: 16,
        classesSupported: ['CC', '1AC'],
        amenities: ['Executive Seating', 'Breakfast Included', 'Newspapers', 'Large Windows'],
        isActive: true,
      },
      {
        trainNumber: '22436',
        trainName: 'Vande Bharat Express (NDLS - BSB)',
        trainType: 'Vande Bharat Express',
        totalCoaches: 16,
        classesSupported: ['CC', '1AC'],
        amenities: ['180° Rotating Seats', 'Onboard Infotainment', 'Automatic Doors', 'Bio Vacuum Toilets'],
        isActive: true,
      },
      {
        trainNumber: '12260',
        trainName: 'Sealdah Duronto Express',
        trainType: 'Superfast Express',
        totalCoaches: 18,
        classesSupported: ['2AC', '3AC', 'SL'],
        amenities: ['Point to Point Non-Stop', 'Catering Meals', 'CCTV Security'],
        isActive: true,
      },
    ]);

    // ==========================================
    // 3. SEED BUSES (REDBUS STANDARDS)
    // ==========================================
    console.log('[Seeder] Creating Intercity luxury buses...');
    const buses = await Bus.create([
      {
        busNumber: 'KA-01-F-7788',
        operatorName: 'KSRTC Airavat Club Class',
        busType: 'Volvo Multi-Axle AC Sleeper',
        totalSeats: 36,
        amenities: ['Personal Blanket', 'Mineral Water Bottle', 'Live GPS Tracking', 'USB Fast Charger'],
        isActive: true,
      },
      {
        busNumber: 'DL-01-AX-9921',
        operatorName: 'IntrCity SmartBus Premium Lounge',
        busType: 'Volvo Multi-Axle AC Sleeper',
        totalSeats: 36,
        amenities: ['Private Sleeping Pod', 'Bus Captain Onboard', 'Emergency SOS', 'Free WiFi'],
        isActive: true,
      },
      {
        busNumber: 'MH-12-RN-3344',
        operatorName: 'VRL Travels Luxury Coach',
        busType: 'Scania Luxury AC Seater',
        totalSeats: 40,
        amenities: ['Ergonomic Calf Support', 'Individual Reading Lights', 'Emergency Exit'],
        isActive: true,
      },
      {
        busNumber: 'TS-09-UB-8812',
        operatorName: 'Orange Travels BharatBenz',
        busType: 'BharatBenz Semi-Sleeper',
        totalSeats: 38,
        amenities: ['Air Suspension', 'Movie Screens', 'Luggage Tagging'],
        isActive: true,
      },
    ]);

    // ==========================================
    // 4. SEED CORRIDOR ROUTES
    // ==========================================
    console.log('[Seeder] Creating major travel corridors...');
    const routes = await Route.create([
      // Train Routes
      {
        source: 'New Delhi',
        destination: 'Mumbai Central',
        distanceKm: 1384,
        estimatedDuration: '15h 30m',
        serviceType: 'train',
        stops: [
          { stopName: 'New Delhi (NDLS)', stopOrder: 1, haltDuration: 'Source', distanceFromSourceKm: 0 },
          { stopName: 'Kota Junction (KOTA)', stopOrder: 2, haltDuration: '10 mins', distanceFromSourceKm: 465 },
          { stopName: 'Vadodara Junction (BRC)', stopOrder: 3, haltDuration: '10 mins', distanceFromSourceKm: 992 },
          { stopName: 'Surat (ST)', stopOrder: 4, haltDuration: '5 mins', distanceFromSourceKm: 1122 },
          { stopName: 'Mumbai Central (MMCT)', stopOrder: 5, haltDuration: 'Destination', distanceFromSourceKm: 1384 },
        ],
        isActive: true,
      },
      {
        source: 'New Delhi',
        destination: 'Varanasi Cantt',
        distanceKm: 758,
        estimatedDuration: '08h 00m',
        serviceType: 'train',
        stops: [
          { stopName: 'New Delhi (NDLS)', stopOrder: 1, haltDuration: 'Source', distanceFromSourceKm: 0 },
          { stopName: 'Kanpur Central (CNB)', stopOrder: 2, haltDuration: '5 mins', distanceFromSourceKm: 440 },
          { stopName: 'Prayagraj Junction (PRYJ)', stopOrder: 3, haltDuration: '5 mins', distanceFromSourceKm: 635 },
          { stopName: 'Varanasi Cantt (BSB)', stopOrder: 4, haltDuration: 'Destination', distanceFromSourceKm: 758 },
        ],
        isActive: true,
      },
      {
        source: 'New Delhi',
        destination: 'Bhopal Habibganj',
        distanceKm: 700,
        estimatedDuration: '08h 20m',
        serviceType: 'train',
        stops: [
          { stopName: 'New Delhi (NDLS)', stopOrder: 1, haltDuration: 'Source', distanceFromSourceKm: 0 },
          { stopName: 'Agra Cantt (AGC)', stopOrder: 2, haltDuration: '5 mins', distanceFromSourceKm: 195 },
          { stopName: 'Gwalior (GWL)', stopOrder: 3, haltDuration: '5 mins', distanceFromSourceKm: 313 },
          { stopName: 'Jhansi Junction (JHS)', stopOrder: 4, haltDuration: '8 mins', distanceFromSourceKm: 410 },
          { stopName: 'Bhopal Habibganj (BPL)', stopOrder: 5, haltDuration: 'Destination', distanceFromSourceKm: 700 },
        ],
        isActive: true,
      },
      // Bus Routes
      {
        source: 'Bengaluru',
        destination: 'Chennai Central',
        distanceKm: 350,
        estimatedDuration: '06h 15m',
        serviceType: 'bus',
        stops: [
          { stopName: 'Majestic Bus Terminal', stopOrder: 1, haltDuration: 'Source', distanceFromSourceKm: 0 },
          { stopName: 'Electronic City Toll', stopOrder: 2, haltDuration: '10 mins', distanceFromSourceKm: 22 },
          { stopName: 'Hosur Bypass', stopOrder: 3, haltDuration: '5 mins', distanceFromSourceKm: 40 },
          { stopName: 'Vellore Bypass', stopOrder: 4, haltDuration: '15 mins', distanceFromSourceKm: 215 },
          { stopName: 'Koyambedu (CMBT)', stopOrder: 5, haltDuration: 'Destination', distanceFromSourceKm: 350 },
        ],
        isActive: true,
      },
      {
        source: 'Pune',
        destination: 'Goa Panaji',
        distanceKm: 450,
        estimatedDuration: '09h 45m',
        serviceType: 'bus',
        stops: [
          { stopName: 'Swargate Bus Stand', stopOrder: 1, haltDuration: 'Source', distanceFromSourceKm: 0 },
          { stopName: 'Satara Bypass', stopOrder: 2, haltDuration: '10 mins', distanceFromSourceKm: 110 },
          { stopName: 'Kolhapur Shirole', stopOrder: 3, haltDuration: '20 mins', distanceFromSourceKm: 235 },
          { stopName: 'Mapusa Bus Stand', stopOrder: 4, haltDuration: '10 mins', distanceFromSourceKm: 430 },
          { stopName: 'Panaji KTC Bus Stand', stopOrder: 5, haltDuration: 'Destination', distanceFromSourceKm: 450 },
        ],
        isActive: true,
      },
      {
        source: 'Mumbai',
        destination: 'Pune',
        distanceKm: 150,
        estimatedDuration: '03h 30m',
        serviceType: 'bus',
        stops: [
          { stopName: 'Dadar TT Circle', stopOrder: 1, haltDuration: 'Source', distanceFromSourceKm: 0 },
          { stopName: 'Vashi Plaza', stopOrder: 2, haltDuration: '10 mins', distanceFromSourceKm: 28 },
          { stopName: 'Wakad Bridge', stopOrder: 3, haltDuration: '5 mins', distanceFromSourceKm: 135 },
          { stopName: 'Pune Station', stopOrder: 4, haltDuration: 'Destination', distanceFromSourceKm: 150 },
        ],
        isActive: true,
      },
    ]);

    // ==========================================
    // 5. SEED SCHEDULES & SEAT INVENTORIES (IN INR ₹)
    // ==========================================
    console.log('[Seeder] Generating dynamic schedules and seat inventories in INR (₹)...');
    
    // Generate dates for next 14 days
    const dates = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(Date.now() + i * 86400000);
      dates.push(d.toISOString().split('T')[0]);
    }

    let createdSchedulesCount = 0;

    for (const dateStr of dates) {
      // 1. Rajdhani Express (Delhi to Mumbai)
      const rajdhaniSched = await Schedule.create({
        serviceType: 'train',
        train: trains[0]._id,
        route: routes[0]._id,
        departureTime: '16:55',
        arrivalTime: '08:25',
        journeyDate: dateStr,
        fares: {
          '1AC': 3450,
          '2AC': 2250,
          '3AC': 1580,
        },
        status: 'Scheduled',
      });

      await createTrainSeatInventory(rajdhaniSched._id, ['1AC', '2AC', '3AC'], { '1AC': 3450, '2AC': 2250, '3AC': 1580 });
      createdSchedulesCount++;

      // 2. Vande Bharat Express (Delhi to Varanasi)
      const vbSched = await Schedule.create({
        serviceType: 'train',
        train: trains[2]._id,
        route: routes[1]._id,
        departureTime: '06:00',
        arrivalTime: '14:00',
        journeyDate: dateStr,
        fares: {
          'CC': 1450,
          '1AC': 2650,
        },
        status: 'Scheduled',
      });

      await createTrainSeatInventory(vbSched._id, ['CC', '1AC'], { 'CC': 1450, '1AC': 2650 });
      createdSchedulesCount++;

      // 3. Shatabdi Express (Delhi to Bhopal)
      const shatabdiSched = await Schedule.create({
        serviceType: 'train',
        train: trains[1]._id,
        route: routes[2]._id,
        departureTime: '06:00',
        arrivalTime: '14:20',
        journeyDate: dateStr,
        fares: {
          'CC': 1180,
          '1AC': 2100,
        },
        status: 'Scheduled',
      });

      await createTrainSeatInventory(shatabdiSched._id, ['CC', '1AC'], { 'CC': 1180, '1AC': 2100 });
      createdSchedulesCount++;

      // 4. KSRTC Airavat Bus (Bengaluru to Chennai)
      const ksrtcBusSched = await Schedule.create({
        serviceType: 'bus',
        bus: buses[0]._id,
        route: routes[3]._id,
        departureTime: '22:30',
        arrivalTime: '04:45',
        journeyDate: dateStr,
        fares: {
          'Sleeper': 1050,
          'Semi-Sleeper': 750,
        },
        status: 'Scheduled',
      });

      await createBusSeatInventory(ksrtcBusSched._id, { 'Sleeper': 1050, 'Semi-Sleeper': 750 });
      createdSchedulesCount++;

      // 5. IntrCity SmartBus (Pune to Goa)
      const goaBusSched = await Schedule.create({
        serviceType: 'bus',
        bus: buses[1]._id,
        route: routes[4]._id,
        departureTime: '21:00',
        arrivalTime: '06:45',
        journeyDate: dateStr,
        fares: {
          'Sleeper': 1200,
          'Semi-Sleeper': 850,
        },
        status: 'Scheduled',
      });

      await createBusSeatInventory(goaBusSched._id, { 'Sleeper': 1200, 'Semi-Sleeper': 850 });
      createdSchedulesCount++;
    }

    // ==========================================
    // 6. CREATE SAMPLE VERIFIED BOOKING & PNR
    // ==========================================
    console.log('[Seeder] Creating sample confirmed bookings with verified PNR...');
    const firstSchedule = await Schedule.findOne({ serviceType: 'train' });
    const firstInventory = await SeatInventory.findOne({ schedule: firstSchedule._id });

    // Mark two seats as booked
    const bookedSeat1 = firstInventory.seats[0].seatNumber;
    const bookedSeat2 = firstInventory.seats[1].seatNumber;

    const samplePnr = 'RB78492019';
    const sampleBookingId = 'RB-BK-2026-104928';
    const sampleTxn = generateTxnId();

    const samplePayment = await Payment.create({
      paymentId: `PAY-${samplePnr}`,
      user: customerUser._id,
      amount: 3235, // 1580 + 1580 + 40 (fee) + 5% gst
      currency: 'INR',
      paymentMethod: 'UPI',
      status: 'SUCCESS',
      transactionRef: sampleTxn,
      simulationNote: 'Verified seed booking transaction in INR',
    });

    const sampleBooking = await Booking.create({
      bookingId: sampleBookingId,
      pnr: samplePnr,
      user: customerUser._id,
      schedule: firstSchedule._id,
      serviceType: 'train',
      passengers: [
        {
          name: 'Arjun Verma',
          age: 32,
          gender: 'Male',
          seatNumber: bookedSeat1,
          seatClass: firstInventory.seats[0].seatClass,
          fare: 1580,
        },
        {
          name: 'Pooja Verma',
          age: 29,
          gender: 'Female',
          seatNumber: bookedSeat2,
          seatClass: firstInventory.seats[1].seatClass,
          fare: 1580,
        },
      ],
      totalFare: 3235,
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'COMPLETED',
      payment: samplePayment._id,
      journeyDate: firstSchedule.journeyDate,
    });

    samplePayment.booking = sampleBooking._id;
    await samplePayment.save();

    firstInventory.seats[0].status = 'booked';
    firstInventory.seats[0].bookingId = sampleBooking._id;
    firstInventory.seats[1].status = 'booked';
    firstInventory.seats[1].bookingId = sampleBooking._id;
    firstInventory.availableCount = firstInventory.seats.filter((s) => s.status === 'available').length;
    await firstInventory.save();

    console.log('========================================================');
    console.log(' SEEDING COMPLETED SUCCESSFULLY!');
    console.log(` - Admin:     admin@railbus.com (pass: Admin@123)`);
    console.log(` - Customer:  customer@railbus.com (pass: Customer@123)`);
    console.log(` - Sample PNR: ${samplePnr}`);
    console.log(` - Currency:  Indian Rupee (INR - ₹) everywhere`);
    console.log(` - Schedules: ${createdSchedulesCount} departures created across next 14 days`);
    console.log('========================================================');

    return { success: true };
  } catch (error) {
    console.error('[Seeder] Error during database seeding:', error);
    throw error;
  }
};

// Helper to create 36-seat layout for Trains (Coach A1 / B1 / C1)
async function createTrainSeatInventory(scheduleId, supportedClasses, fareMap) {
  const seats = [];
  const berthTypes = ['Lower Berth', 'Middle Berth', 'Upper Berth', 'Side Lower', 'Side Upper'];

  let seatIndex = 1;
  for (const cls of supportedClasses) {
    const price = fareMap[cls] || 1200;
    const coachPrefix = cls === '1AC' ? 'H1' : cls === '2AC' ? 'A1' : cls === '3AC' ? 'B1' : 'C1';

    for (let i = 1; i <= 12; i++) {
      const berth = berthTypes[(i - 1) % berthTypes.length];
      seats.push({
        seatNumber: `${coachPrefix}-${i}`,
        coachOrDeck: `Coach ${coachPrefix}`,
        seatClass: cls,
        berthType: berth,
        price,
        status: 'available',
      });
      seatIndex++;
    }
  }

  await SeatInventory.create({
    schedule: scheduleId,
    totalSeats: seats.length,
    availableCount: seats.length,
    seats,
  });
}

// Helper to create 30-seat layout for Buses (Lower Deck & Upper Deck Sleeper/Seater)
async function createBusSeatInventory(scheduleId, fareMap) {
  const seats = [];

  // Lower Deck (15 seats)
  for (let i = 1; i <= 15; i++) {
    const isWindow = i % 3 === 1 || i % 3 === 0;
    seats.push({
      seatNumber: `L${i}`,
      coachOrDeck: 'Lower Deck',
      seatClass: 'Semi-Sleeper',
      berthType: isWindow ? 'Window' : 'Aisle',
      price: fareMap['Semi-Sleeper'] || 750,
      status: 'available',
    });
  }

  // Upper Deck (15 Sleeper pods)
  for (let i = 1; i <= 15; i++) {
    const isWindow = i % 2 !== 0;
    seats.push({
      seatNumber: `U${i}`,
      coachOrDeck: 'Upper Deck',
      seatClass: 'Sleeper',
      berthType: isWindow ? 'Window' : 'Aisle',
      price: fareMap['Sleeper'] || 1050,
      status: 'available',
    });
  }

  await SeatInventory.create({
    schedule: scheduleId,
    totalSeats: seats.length,
    availableCount: seats.length,
    seats,
  });
}

// Auto-run if executed from CLI
if (require.main === module) {
  seedData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedData;
