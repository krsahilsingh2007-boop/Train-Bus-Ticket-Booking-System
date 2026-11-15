const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Schedule = require('../models/Schedule');
const SeatInventory = require('../models/SeatInventory');

// Helper to clean city input (removes bracketed codes like '(BLR)' or '(MAS)')
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

// Helper: Dynamically creates and persists realistic buses, routes, and seat inventory for any Indian corridor
const generateDynamicBusSchedules = async (sourceRaw, destinationRaw, journeyDate) => {
  const source = formatCity(sourceRaw);
  const destination = formatCity(destinationRaw);

  console.log(`[BusEngine] Auto-generating on-demand intercity bus schedules for corridor: ${source} ⇄ ${destination} on ${journeyDate}`);

  const hash = Math.abs((source.length * 41 + destination.length * 67) % 600);
  const distanceKm = 250 + hash; // Bus distance 250 - 850 km
  const travelHours = Math.max(3, Math.round(distanceKm / 55)); // Avg speed 55 km/h
  const travelMinutes = (hash % 4) * 15;
  const durationStr = `${String(travelHours).padStart(2, '0')}h ${String(travelMinutes).padStart(2, '0')}m`;

  let route = await Route.findOne({
    serviceType: 'bus',
    source: { $regex: new RegExp(`^${escapeRegex(source)}$`, 'i') },
    destination: { $regex: new RegExp(`^${escapeRegex(destination)}$`, 'i') },
  });

  if (!route) {
    route = await Route.create({
      source,
      destination,
      distanceKm,
      estimatedDuration: durationStr,
      serviceType: 'bus',
      stops: [
        { stopName: `${source} Central Bus Stand`, stopOrder: 1, haltDuration: 'Source', distanceFromSourceKm: 0 },
        { stopName: `Highway Rest Plaza`, stopOrder: 2, haltDuration: '20 mins', distanceFromSourceKm: Math.round(distanceKm * 0.5) },
        { stopName: `${destination} City Hub`, stopOrder: 3, haltDuration: 'Destination', distanceFromSourceKm: distanceKm },
      ],
      isActive: true,
    });
  }

  const busSeedConfig = [
    {
      busNumber: `DL-${10 + (hash % 80)}-AX-${1000 + (hash % 8999)}`,
      operatorName: `IntrCity SmartBus Premium Lounge`,
      busType: 'Volvo Multi-Axle AC Sleeper',
      totalSeats: 36,
      amenities: ['Individual Sleeping Pod', 'Bus Captain Onboard', 'Emergency SOS', 'High Speed WiFi'],
      departureTime: '21:00',
      fares: { 'Sleeper': 1180, 'Semi-Sleeper': 780 },
    },
    {
      busNumber: `KA-${10 + (hash % 80)}-F-${1000 + (hash % 8999)}`,
      operatorName: `KSRTC Airavat Diamond Class`,
      busType: 'Scania Luxury AC Seater',
      totalSeats: 40,
      amenities: ['Personal Blanket', 'Mineral Water Bottle', 'Live GPS Tracking', 'USB Fast Charger'],
      departureTime: '22:30',
      fares: { 'Sleeper': 1250, 'Semi-Sleeper': 850 },
    },
  ];

  const createdSchedules = [];

  for (const config of busSeedConfig) {
    let bus = await Bus.findOne({ busNumber: config.busNumber });
    if (!bus) {
      bus = await Bus.create({
        busNumber: config.busNumber,
        operatorName: config.operatorName,
        busType: config.busType,
        totalSeats: config.totalSeats,
        amenities: config.amenities,
        isActive: true,
      });
    }

    const [depH, depM] = config.departureTime.split(':').map(Number);
    const arrH = (depH + travelHours) % 24;
    const arrM = (depM + travelMinutes) % 60;
    const arrivalTime = `${String(arrH).padStart(2, '0')}:${String(arrM).padStart(2, '0')}`;

    let schedule = await Schedule.findOne({
      serviceType: 'bus',
      bus: bus._id,
      route: route._id,
      journeyDate,
    });

    if (!schedule) {
      schedule = await Schedule.create({
        serviceType: 'bus',
        bus: bus._id,
        route: route._id,
        departureTime: config.departureTime,
        arrivalTime,
        journeyDate,
        fares: config.fares,
        status: 'Scheduled',
        isActive: true,
      });

      // Create Bus Seat Layout (Lower Deck & Upper Deck)
      const seats = [];

      // Lower Deck
      for (let i = 1; i <= 15; i++) {
        seats.push({
          seatNumber: `L${i}`,
          coachOrDeck: 'Lower Deck',
          seatClass: 'Semi-Sleeper',
          berthType: i % 3 === 0 ? 'Window' : 'Aisle',
          price: config.fares['Semi-Sleeper'] || 750,
          status: 'available',
        });
      }

      // Upper Deck Sleeper
      for (let i = 1; i <= 15; i++) {
        seats.push({
          seatNumber: `U${i}`,
          coachOrDeck: 'Upper Deck',
          seatClass: 'Sleeper',
          berthType: i % 2 !== 0 ? 'Window' : 'Aisle',
          price: config.fares['Sleeper'] || 1150,
          status: 'available',
        });
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

// @desc    Search available bus schedules with live seating and INR fares
// @route   GET /api/buses/search
// @access  Public
const searchBuses = async (req, res, next) => {
  try {
    const { source, destination, date } = req.query;

    const cleanSource = cleanCity(source);
    const cleanDestination = cleanCity(destination);

    if (!cleanSource || !cleanDestination) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both origin (source) and destination city',
      });
    }

    const journeyDate = date || new Date(Date.now() + 86400000).toISOString().split('T')[0];

    let routes = await Route.find({
      serviceType: 'bus',
      source: { $regex: new RegExp(escapeRegex(cleanSource), 'i') },
      destination: { $regex: new RegExp(escapeRegex(cleanDestination), 'i') },
      isActive: true,
    });

    let schedules = [];

    if (routes.length > 0) {
      const routeIds = routes.map((r) => r._id);
      schedules = await Schedule.find({
        serviceType: 'bus',
        route: { $in: routeIds },
        journeyDate,
        isActive: true,
      })
        .populate('bus')
        .populate('route');
    }

    // Dynamic generation if corridor does not exist yet
    if (schedules.length === 0) {
      await generateDynamicBusSchedules(cleanSource, cleanDestination, journeyDate);

      routes = await Route.find({
        serviceType: 'bus',
        source: { $regex: new RegExp(escapeRegex(cleanSource), 'i') },
        destination: { $regex: new RegExp(escapeRegex(cleanDestination), 'i') },
      });

      const routeIds = routes.map((r) => r._id);
      schedules = await Schedule.find({
        serviceType: 'bus',
        route: { $in: routeIds },
        journeyDate,
        isActive: true,
      })
        .populate('bus')
        .populate('route');
    }

    const results = await Promise.all(
      schedules.map(async (schedule) => {
        const inventory = await SeatInventory.findOne({ schedule: schedule._id });

        const faresObj = schedule.fares instanceof Map ? Object.fromEntries(schedule.fares) : schedule.fares;

        let sleeperCount = 0;
        let seaterCount = 0;
        if (inventory) {
          inventory.seats.forEach((s) => {
            if (s.status === 'available') {
              if (s.seatClass?.toLowerCase().includes('sleeper')) sleeperCount++;
              else seaterCount++;
            }
          });
        }

        return {
          scheduleId: schedule._id,
          journeyDate: schedule.journeyDate,
          departureTime: schedule.departureTime,
          arrivalTime: schedule.arrivalTime,
          duration: schedule.route?.estimatedDuration || '07h 30m',
          distanceKm: schedule.route?.distanceKm || 350,
          status: schedule.status,
          currency: 'INR',
          symbol: '₹',
          bus: {
            id: schedule.bus?._id,
            busNumber: schedule.bus?.busNumber,
            operatorName: schedule.bus?.operatorName,
            busType: schedule.bus?.busType,
            amenities: schedule.bus?.amenities || ['Live Tracking', 'Water Bottle', 'Blanket', 'Charging Ports'],
            totalSeats: schedule.bus?.totalSeats || 36,
          },
          route: {
            id: schedule.route?._id,
            source: schedule.route?.source,
            destination: schedule.route?.destination,
            boardingPoints: schedule.route?.stops || [],
          },
          fares: faresObj,
          totalAvailableSeats: inventory?.availableCount ?? 0,
          sleeperAvailable: sleeperCount,
          seaterAvailable: seaterCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single bus details by ID
// @route   GET /api/buses/:id
// @access  Public
const getBusById = async (req, res, next) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found',
      });
    }

    res.status(200).json({
      success: true,
      data: bus,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get city autocomplete suggestions
// @route   GET /api/buses/cities
// @access  Public
const getCities = async (req, res, next) => {
  try {
    const defaultCities = [
      'Bengaluru', 'Chennai Central', 'Pune', 'Goa Panaji', 'Mumbai',
      'Hyderabad', 'Chandigarh', 'New Delhi', 'Jaipur', 'Varanasi',
      'Kolkata', 'Ahmedabad', 'Surat', 'Lucknow', 'Agra', 'Amritsar'
    ];
    const sources = await Route.find({ serviceType: 'bus' }).distinct('source');
    const destinations = await Route.find({ serviceType: 'bus' }).distinct('destination');
    const uniqueCities = Array.from(new Set([...defaultCities, ...sources, ...destinations])).sort();

    res.status(200).json({
      success: true,
      data: uniqueCities,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchBuses,
  getBusById,
  getCities,
};
