const Payment = require('../models/Payment');
const { generateTxnId } = require('../utils/pnrGenerator');

// @desc    Process simulated sandbox payment (Supports testing both success and failure)
// @route   POST /api/payments/process
// @access  Private (Bearer token)
const processPayment = async (req, res, next) => {
  try {
    const { amount, paymentMethod = 'UPI', simulateFailure = false } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount',
      });
    }

    const txnRef = generateTxnId();

    // Check if test simulation requested failure (for automated testing TC-13)
    if (simulateFailure) {
      const failedPayment = await Payment.create({
        paymentId: `PAY-FAIL-${Date.now()}`,
        user: req.user.id,
        amount: Number(amount),
        currency: 'INR',
        paymentMethod,
        status: 'FAILED',
        transactionRef: txnRef,
        simulationNote: 'Simulated payment failure for QA verification',
      });

      return res.status(402).json({
        success: false,
        message: 'Payment simulation declined: Card/UPI transaction was not approved',
        paymentId: failedPayment.paymentId,
        transactionRef: txnRef,
      });
    }

    const payment = await Payment.create({
      paymentId: `PAY-${Date.now()}`,
      user: req.user.id,
      amount: Number(amount),
      currency: 'INR',
      paymentMethod,
      status: 'SUCCESS',
      transactionRef: txnRef,
      simulationNote: 'Simulated payment approved successfully',
    });

    res.status(200).json({
      success: true,
      message: 'Payment approved successfully',
      paymentId: payment.paymentId,
      transactionRef: txnRef,
      amount: payment.amount,
      currency: 'INR',
      symbol: '₹',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment receipt by ID
// @route   GET /api/payments/:id
// @access  Private (Bearer token)
const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('booking');
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found',
      });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  processPayment,
  getPaymentById,
};
