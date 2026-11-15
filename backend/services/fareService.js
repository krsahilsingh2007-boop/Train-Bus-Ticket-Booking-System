/**
 * Server-side fare calculation and verification in Indian Rupees (INR - ₹)
 * Reference: IRCTC & RedBus industry standards (Base Fare + IRCTC/Platform Fee + 5% GST)
 */
const calculateFare = (seats, scheduleFares) => {
  if (!Array.isArray(seats) || seats.length === 0) {
    throw new Error('At least one seat must be selected to calculate fare');
  }

  let baseFare = 0;
  const seatBreakdown = [];

  for (const seat of seats) {
    let seatPrice = seat.price;
    if (!seatPrice && scheduleFares) {
      if (typeof scheduleFares.get === 'function') {
        seatPrice = scheduleFares.get(seat.seatClass);
      } else {
        seatPrice = scheduleFares[seat.seatClass];
      }
    }
    // Default fallback tier in INR
    seatPrice = Number(seatPrice) || 850;

    baseFare += Number(seatPrice);
    seatBreakdown.push({
      seatNumber: seat.seatNumber,
      seatClass: seat.seatClass,
      price: Number(seatPrice),
    });
  }

  // IRCTC / RedBus standard platform convenience fee and GST
  const platformFee = 35.0; // ₹35 flat booking convenience fee
  const gst = Number((baseFare * 0.05).toFixed(2)); // 5% GST on passenger transport
  const totalFare = Math.round(baseFare + platformFee + gst); // Standard round to nearest Rupee

  return {
    currency: 'INR',
    symbol: '₹',
    baseFare: Number(baseFare.toFixed(2)),
    platformFee,
    gst,
    totalFare,
    seatBreakdown,
  };
};

module.exports = {
  calculateFare,
};
