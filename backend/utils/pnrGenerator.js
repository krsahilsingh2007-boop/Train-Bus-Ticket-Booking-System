const crypto = require('crypto');

/**
 * Generates an authentic 10-character alphanumeric PNR
 * Example: RB78492019
 */
const generatePNR = () => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude ambiguous characters (0, O, 1, I)
  let pnr = 'RB';
  for (let i = 0; i < 8; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pnr;
};

/**
 * Generates a unique Booking ID
 * Example: RB-BK-2026-981423
 */
const generateBookingId = () => {
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const year = new Date().getFullYear();
  return `RB-BK-${year}-${randomSuffix}`;
};

/**
 * Generates a Payment Transaction ID
 * Example: TXN-SANDBOX-817263
 */
const generateTxnId = () => {
  const hex = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `TXN-SANDBOX-${hex}`;
};

module.exports = {
  generatePNR,
  generateBookingId,
  generateTxnId,
};
