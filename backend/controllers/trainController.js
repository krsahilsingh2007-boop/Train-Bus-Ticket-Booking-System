const Train = require('../models/Train');
const Route = require('../models/Route');
const Schedule = require('../models/Schedule');
const SeatInventory = require('../models/SeatInventory');

// Helper to clean city input (removes bracketed codes like '(NDLS)' or '(MMCT)')
const cleanCity = (str) => {
  if (!str) return '';
  return str.replace(/\(.*?\)/g, '').trim();
};

const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Helper to normalize and capitalize city names
const formatCity = (city) => {
  const cleaned = cleanCity(city);
  if (!cleaned) return '';
  return cleaned
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper: Dynamically creates and persists realistic trains, routes, and seat inventory for any Indian corridor
const generateDynamicTrainSchedules = async (sourceRaw, destinationRaw, journeyDate) => {
  const source = formatCity(sourceRaw);
  const destination = formatCity(destinationRaw);

  console.log(`[TrainEngine] Auto-generating on-demand express railway schedules for corridor: ${source} ⇄ ${destination} on ${journeyDate}`);

  // 1. Calculate approximate distance & duration
  const hash = Math.abs((source.length * 37 + destination.length * 53) % 900);
  const distanceKm = 400 + hash; // Realistic Indian railway distance: 400 - 1300 km
  const travelHours = Math.max(4, Math.round(distanceKm / 75)); // Avg speed 75 km/h
  const travelMinutes = (hash % 4) * 15;
  const durationStr = `${String(travelHours).padStart(2, '0')}h ${String(travelMinutes).padStart(2, '0')}m`;

  // 2. Create or find Route
  let route = await Route.findOne({
    serviceType: 'train',
    source: { $regex: new RegExp(`^${escapeRegex(source)}$`, 'i') },
    destination: { $regex: new RegExp(`^${escapeRegex(destination)}$`, 'i') },
  });

  if (!route) {
    route = await Route.create({
      source,
      destination,
      distanceKm,
      estimatedDuration: durationStr,
      serviceType: 'train',
      stops: [
        { stopName: `${source} Junction`, stopOrder: 1, haltDuration: 'Source', distanceFromSourceKm: 0 },
        { stopName: `Central Junction`, stopOrder: 2, haltDuration: '10 mins', distanceFromSourceKm: Math.round(distanceKm * 0.45) },
        { stopName: `${destination} Terminus`, stopOrder: 3, haltDuration: 'Destination', distanceFromSourceKm: distanceKm },
      ],
      isActive: true,
    });
  }

  // 3. Define 2 Realistic Trains
  const trainSeedConfig = [
    {
      trainNumber: `${12000 + (hash % 900)}`,
      trainName: `${source} - ${destination} Superfast Express`,
      trainType: 'Superfast Express',
      totalCoaches: 20,
      classesSupported: ['1AC', '2AC', '3AC', 'SL'],
      amenities: ['Catering Meals', 'Free High Speed WiFi', 'Clean Bedroll', 'Charging Sockets'],
      departureTime: '06:30',
      fares: { '1AC': 3150, '2AC': 2100, '3AC': 1480, 'SL': 420 },
    },
    {
      trainNumber: `${22400 + (hash % 500)}`,
      trainName: `${source} - ${destination} Vande Bharat Express`,
      trainType: 'Vande Bharat Express',
      totalCoaches: 16,
      classesSupported: ['CC', '1AC'],
      amenities: ['180° Rotating Seats', 'Onboard Infotainment', 'Automatic Doors', 'Bio Vacuum Toilets'],
      departureTime: '15:15',
      fares: { 'CC': 1350, '1AC': 2550 },
    },
    {
      trainNumber: `${12900 + (hash % 800)}`,
      trainName: `${source} - ${destination} AC Duronto Express`,
      trainType: 'Superfast Express',
      totalCoaches: 18,
      classesSupported: ['1AC', '2AC', '3AC'],
      amenities: ['Point to Point Fast Run', 'Complimentary Food', 'Air Conditioned'],
      departureTime: '21:45',
      fares: { '1AC': 3350, '2AC': 2250, '3AC': 1550 },
    },
  ];

  const createdSchedules = [];

  for (const config of trainSeedConfig) {
    // Upsert Train
    let train = await Train.findOne({ trainNumber: config.trainNumber });
    if (!train) {
      train = await Train.create({
        trainNumber: config.trainNumber,
        trainName: config.trainName,
        trainType: config.trainType,
        totalCoaches: config.totalCoaches,
        classesSupported: config.classesSupported,
        amenities: config.amenities,
        isActive: true,
      });
    }

    // Calculate arrival time
    const [depH, depM] = config.departureTime.split(':').map(Number);
    const arrH = (depH + travelHours) % 24;
    const arrM = (depM + travelMinutes) % 60;
    const arrivalTime = `${String(arrH).padStart(2, '0')}:${String(arrM).padStart(2, '0')}`;

    // Create Schedule for this journey date
    let schedule = await Schedule.findOne({
      serviceType: 'train',
      train: train._id,
      route: route._id,
      journeyDate,
    });

    if (!schedule) {
      schedule = await Schedule.create({
        serviceType: 'train',
        train: train._id,
        route: route._id,
        departureTime: config.departureTime,
        arrivalTime,
        journeyDate,
        fares: config.fares,
        status: 'Scheduled',
        isActive: true,
      });

      // Create Complete 36-Seat Inventory with individual pricing in INR
      const seats = [];
      const berthTypes = ['Lower Berth', 'Middle Berth', 'Upper Berth', 'Side Lower', 'Side Upper'];

      for (const cls of config.classesSupported) {
        const price = config.fares[cls] || 1200;
        const coachPrefix = cls === '1AC' ? 'H1' : cls === '2AC' ? 'A1' : cls === '3AC' ? 'B1' : cls === 'CC' ? 'C1' : 'S1';

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
        }
      }

      await SeatInventory.create({
        schedule: schedule._id,
        totalSeats: seats.length,
        availableCount: seats.length,
        seats,
      });
    }

    createdSchedules.push(schedule._id);
  }

  return createdSchedules;
};

// @desc    Search available train schedules with live seating and INR fares
// @route   GET /api/trains/search
// @access  Public
const searchTrains = async (req, res, next) => {
  try {
    const { source, destination, date, class: travelClass } = req.query;

    const cleanSource = cleanCity(source);
    const cleanDestination = cleanCity(destination);

    if (!cleanSource || !cleanDestination) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both origin (source) and destination',
      });
    }

    const journeyDate = date || new Date(Date.now() + 86400000).toISOString().split('T')[0];

    // Find routes matching source & destination (including partial matches and case-insensitivity)
    let routes = await Route.find({
      serviceType: 'train',
      source: { $regex: new RegExp(escapeRegex(cleanSource), 'i') },
      destination: { $regex: new RegExp(escapeRegex(cleanDestination), 'i') },
      isActive: true,
    });

    let schedules = [];

    if (routes.length > 0) {
      const routeIds = routes.map((r) => r._id);
      schedules = await Schedule.find({
        serviceType: 'train',
        route: { $in: routeIds },
        journeyDate,
        isActive: true,
      })
        .populate('train')
        .populate('route');
    }

    // If no schedules exist for this corridor and date, dynamically generate them on-demand!
    if (schedules.length === 0) {
      await generateDynamicTrainSchedules(cleanSource, cleanDestination, journeyDate);

      routes = await Route.find({
        serviceType: 'train',
        source: { $regex: new RegExp(escapeRegex(cleanSource), 'i') },
        destination: { $regex: new RegExp(escapeRegex(cleanDestination), 'i') },
      });

      const routeIds = routes.map((r) => r._id);
      schedules = await Schedule.find({
        serviceType: 'train',
        route: { $in: routeIds },
        journeyDate,
        isActive: true,
      })
        .populate('train')
        .populate('route');
    }

    // Enrich schedules with live seat inventory counts and fares in INR
    const results = await Promise.all(
      schedules.map(async (schedule) => {
        const inventory = await SeatInventory.findOne({ schedule: schedule._id });

        const classAvailability = {};
        if (inventory) {
          inventory.seats.forEach((seat) => {
            if (!classAvailability[seat.seatClass]) {
              classAvailability[seat.seatClass] = {
                available: 0,
                total: 0,
                price: seat.price || schedule.fares?.get(seat.seatClass) || 450,
              };
            }
            classAvailability[seat.seatClass].total += 1;
            if (seat.status === 'available') {
              classAvailability[seat.seatClass].available += 1;
            }
          });
        }

        const faresObj = schedule.fares instanceof Map ? Object.fromEntries(schedule.fares) : schedule.fares;

        return {
          scheduleId: schedule._id,
          journeyDate: schedule.journeyDate,
          departureTime: schedule.departureTime,
          arrivalTime: schedule.arrivalTime,
          duration: schedule.route?.estimatedDuration || '12h 00m',
          distanceKm: schedule.route?.distanceKm || 800,
          status: schedule.status,
          currency: 'INR',
          symbol: '₹',
          train: {
            id: schedule.train?._id,
            trainNumber: schedule.train?.trainNumber,
            trainName: schedule.train?.trainName,
            trainType: schedule.train?.trainType,
            amenities: schedule.train?.amenities || ['Pantry Car', 'High Speed WiFi', 'Charging Ports'],
            classesSupported: schedule.train?.classesSupported || ['1AC', '2AC', '3AC', 'SL'],
          },
          route: {
            id: schedule.route?._id,
            source: schedule.route?.source,
            destination: schedule.route?.destination,
            stops: schedule.route?.stops || [],
          },
          fares: faresObj,
          classAvailability,
          totalAvailableSeats: inventory?.availableCount ?? 0,
        };
      })
    );

    // Filter by travel class if specified
    const filteredResults = travelClass && travelClass !== 'ALL'
      ? results.filter((item) => item.train.classesSupported.includes(travelClass))
      : results;

    res.status(200).json({
      success: true,
      count: filteredResults.length,
      data: filteredResults,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single train details by ID
// @route   GET /api/trains/:id
// @access  Public
const getTrainById = async (req, res, next) => {
  try {
    const train = await Train.findById(req.params.id);
    if (!train) {
      return res.status(404).json({
        success: false,
        message: 'Train not found',
      });
    }

    res.status(200).json({
      success: true,
      data: train,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get station autocomplete suggestions
// @route   GET /api/trains/stations
// @access  Public
const getStations = async (req, res, next) => {
  try {
    const defaultStations = [
      'New Delhi', 'Mumbai Central', 'Chandigarh', 'Bengaluru', 'Chennai Central',
      'Varanasi Cantt', 'Kolkata Howrah', 'Hyderabad', 'Pune', 'Jaipur',
      'Bhopal Habibganj', 'Ahmedabad', 'Amritsar', 'Lucknow', 'Goa Panaji', 'Patna', 'Surat'
    ];
    const stations = await Route.find({ serviceType: 'train' }).distinct('source');
    const destinations = await Route.find({ serviceType: 'train' }).distinct('destination');
    const uniqueStations = Array.from(new Set([...defaultStations, ...stations, ...destinations])).sort();

    res.status(200).json({
      success: true,
      data: uniqueStations,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchTrains,
  getTrainById,
  getStations,
};
