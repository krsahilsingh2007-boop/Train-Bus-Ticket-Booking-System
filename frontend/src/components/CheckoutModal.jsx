import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  QrCode, 
  Building, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  ArrowLeft,
  Calendar,
  Ticket
} from 'lucide-react';
import api from '../services/api';

const CheckoutModal = ({ scheduleId, scheduleInfo, selectedSeats, fareSummary, onClose, onBookingSuccess }) => {
  // Initialize passenger rows for each selected seat
  const [passengers, setPassengers] = useState(
    selectedSeats.map((seat) => ({
      seatNumber: seat.seatNumber,
      seatClass: seat.seatClass,
      name: '',
      age: '',
      gender: 'Male',
      berthPreference: seat.berthType || 'No Preference',
    }))
  );

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handlePaymentAndBook = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate passenger inputs
    for (const p of passengers) {
      if (!p.name.trim()) {
        setError(`Please enter passenger name for seat ${p.seatNumber}`);
        return;
      }
      if (!p.age || isNaN(p.age) || Number(p.age) <= 0 || Number(p.age) > 120) {
        setError(`Please enter a valid age (1-120) for seat ${p.seatNumber}`);
        return;
      }
    }

    try {
      setLoading(true);

      // Check if testing simulated payment failure (TC-13)
      if (simulateFailure) {
        await api.post('/payments/process', {
          amount: fareSummary.total,
          paymentMethod,
          simulateFailure: true,
        });
      }

      // Step 1: Process Booking on backend
      const res = await api.post('/bookings', {
        scheduleId,
        passengers: passengers.map((p) => ({
          name: p.name,
          age: Number(p.age),
          gender: p.gender,
          seatNumber: p.seatNumber,
          seatClass: p.seatClass,
        })),
        paymentMethod,
      });

      setConfirmedBooking(res.data.booking);
      if (onBookingSuccess) {
        onBookingSuccess(res.data.booking);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Payment simulation failed or booking could not be completed.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!confirmedBooking) return;
    const downloadUrl = `${api.defaults.baseURL}/bookings/${confirmedBooking.id || confirmedBooking._id}/ticket-pdf`;
    window.open(downloadUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D3536]/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#FBF0E6] border border-[#E8D5C2] rounded-3xl max-w-2xl w-full shadow-elevated overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-[#407778] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FBF0E6] text-[#407778] flex items-center justify-center font-bold">
              <Ticket className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {confirmedBooking ? 'Booking Confirmed!' : 'Passenger Manifest & Checkout'}
              </h2>
              <p className="text-xs text-[#F7E1C9]">
                {scheduleInfo?.name || 'Selected Journey'} • {scheduleInfo?.journeyDate}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          
          {confirmedBooking ? (
            /* ==================================================== */
            /* SUCCESS CONFIRMATION SCREEN                           */
            /* ==================================================== */
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Payment Completed & Seats Locked
                </span>
                <h3 className="text-2xl font-extrabold text-[#407778] mt-2">
                  E-Ticket Successfully Issued
                </h3>
                <p className="text-sm text-[#526D6E] mt-1">
                  Your reservation is confirmed. An official electronic ticket has been generated.
                </p>
              </div>

              {/* PNR Spotlight Box */}
              <div className="bg-[#F7E1C9] border border-[#E8D5C2] rounded-2xl p-5 max-w-md mx-auto text-center shadow-card">
                <div className="text-xs uppercase font-bold text-[#526D6E] tracking-wider">
                  VERIFIED PNR NUMBER
                </div>
                <div className="text-3xl font-black text-[#407778] tracking-widest my-1">
                  {confirmedBooking.pnr}
                </div>
                <div className="text-xs text-[#1D3536] font-medium">
                  Booking ID: {confirmedBooking.bookingId}
                </div>
                <div className="mt-3 pt-3 border-t border-[#D9C5B2] flex justify-between text-xs text-[#526D6E]">
                  <span>Total Amount Paid:</span>
                  <span className="font-bold text-[#407778] text-sm">₹{confirmedBooking.totalFare} (INR)</span>
                </div>
              </div>

              {/* Passenger Summary */}
              <div className="bg-white/90 border border-[#E8D5C2] rounded-2xl p-4 text-left text-xs space-y-2">
                <div className="font-bold text-[#407778] border-b border-[#E8D5C2] pb-1.5 flex justify-between">
                  <span>Passenger Manifest</span>
                  <span>Seats: {confirmedBooking.passengers.map((p) => p.seatNumber).join(', ')}</span>
                </div>
                {confirmedBooking.passengers.map((p, idx) => (
                  <div key={idx} className="flex justify-between py-0.5 text-[#1D3536]">
                    <span>{idx + 1}. {p.name} ({p.age} yrs, {p.gender})</span>
                    <span className="font-semibold text-[#407778]">{p.seatNumber}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-[#407778] hover:bg-[#346263] transition-all shadow-sm text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download PDF Boarding Pass
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-[#407778] border border-[#407778] hover:bg-[#407778]/10 transition-colors text-sm"
                >
                  Close & Done
                </button>
              </div>
            </div>
          ) : (
            /* ==================================================== */
            /* PASSENGER DETAILS FORM & SIMULATED CHECKOUT          */
            /* ==================================================== */
            <form onSubmit={handlePaymentAndBook} className="space-y-6">
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3.5 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Passenger Form Cards */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#407778]">
                  Enter Passenger Details for Selected Seats ({selectedSeats.length})
                </h3>

                {passengers.map((passenger, index) => (
                  <div
                    key={passenger.seatNumber}
                    className="bg-[#F7E1C9] border border-[#E8D5C2] rounded-2xl p-4 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-[#407778]">
                      <span>Passenger #{index + 1}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#407778] text-white">
                        Seat: {passenger.seatNumber} ({passenger.seatClass})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      {/* Name */}
                      <div className="sm:col-span-6">
                        <label className="block text-[11px] font-semibold text-[#526D6E] mb-1">
                          Full Name as on Govt ID *
                        </label>
                        <input
                          type="text"
                          required
                          value={passenger.name}
                          onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                          placeholder="e.g. Ramesh Kumar"
                          className="w-full px-3 py-2 rounded-xl bg-[#FBF0E6] border border-[#D9C5B2] text-xs text-[#1D3536] font-medium focus:outline-none focus:ring-2 focus:ring-[#407778]/20 focus:border-[#407778]"
                        />
                      </div>

                      {/* Age */}
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-semibold text-[#526D6E] mb-1">
                          Age (Years) *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="120"
                          value={passenger.age}
                          onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                          placeholder="e.g. 28"
                          className="w-full px-3 py-2 rounded-xl bg-[#FBF0E6] border border-[#D9C5B2] text-xs text-[#1D3536] font-medium focus:outline-none focus:ring-2 focus:ring-[#407778]/20 focus:border-[#407778]"
                        />
                      </div>

                      {/* Gender */}
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-semibold text-[#526D6E] mb-1">
                          Gender *
                        </label>
                        <select
                          value={passenger.gender}
                          onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#FBF0E6] border border-[#D9C5B2] text-xs text-[#1D3536] font-medium focus:outline-none focus:ring-2 focus:ring-[#407778]/20 focus:border-[#407778]"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#407778]">
                  Select Simulated Payment Gateway
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all text-xs font-bold ${
                      paymentMethod === 'UPI'
                        ? 'border-[#407778] bg-[#F7E1C9] text-[#407778] shadow-sm'
                        : 'border-[#E8D5C2] bg-[#FBF0E6] text-[#526D6E] hover:border-[#65AFB0]'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-[#65AFB0]" />
                    <span>UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all text-xs font-bold ${
                      paymentMethod === 'CARD'
                        ? 'border-[#407778] bg-[#F7E1C9] text-[#407778] shadow-sm'
                        : 'border-[#E8D5C2] bg-[#FBF0E6] text-[#526D6E] hover:border-[#65AFB0]'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-[#65AFB0]" />
                    <span>Credit / Debit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('NET_BANKING')}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all text-xs font-bold ${
                      paymentMethod === 'NET_BANKING'
                        ? 'border-[#407778] bg-[#F7E1C9] text-[#407778] shadow-sm'
                        : 'border-[#E8D5C2] bg-[#FBF0E6] text-[#526D6E] hover:border-[#65AFB0]'
                    }`}
                  >
                    <Building className="w-5 h-5 text-[#65AFB0]" />
                    <span>Net Banking</span>
                  </button>
                </div>

                {/* QA Failure Simulation Toggle */}
                <div className="bg-[#FBF0E6] border border-[#D9C5B2] rounded-xl p-3 flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="simulateFailCheck"
                    checked={simulateFailure}
                    onChange={(e) => setSimulateFailure(e.target.checked)}
                    className="w-4 h-4 rounded text-[#407778] focus:ring-[#407778]"
                  />
                  <label htmlFor="simulateFailCheck" className="text-xs font-medium text-[#1D3536] cursor-pointer">
                    Simulate Payment Failure <span className="text-[#526D6E]">(QA Automation TC-13 verification)</span>
                  </label>
                </div>
              </div>

              {/* Fare Breakdown Box in INR (₹) */}
              <div className="bg-[#F7E1C9] border border-[#E8D5C2] rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex justify-between text-[#526D6E]">
                  <span>Base Ticket Fare ({selectedSeats.length} seats):</span>
                  <span className="font-semibold text-[#1D3536]">₹{fareSummary.base}</span>
                </div>
                <div className="flex justify-between text-[#526D6E]">
                  <span>IRCTC / Platform Service Fee:</span>
                  <span className="font-semibold text-[#1D3536]">₹{fareSummary.platformFee}</span>
                </div>
                <div className="flex justify-between text-[#526D6E]">
                  <span>Transit GST (5%):</span>
                  <span className="font-semibold text-[#1D3536]">₹{fareSummary.gst}</span>
                </div>
                <div className="pt-2 border-t border-[#D9C5B2] flex justify-between items-center text-sm font-extrabold text-[#407778]">
                  <span>Total Amount Payable (INR):</span>
                  <span className="text-xl">₹{fareSummary.total}</span>
                </div>
              </div>

              {/* Submission CTA */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl font-semibold text-xs border border-[#407778] text-[#407778] hover:bg-[#407778]/10 transition-colors"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-xl font-bold text-white bg-[#407778] hover:bg-[#346263] transition-all shadow-sm text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing Sandbox Payment...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-[#F7E1C9]" />
                      Pay ₹{fareSummary.total} & Confirm Booking
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};

export default CheckoutModal;
