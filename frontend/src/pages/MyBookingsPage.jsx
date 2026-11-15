import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  CalendarCheck, 
  Search, 
  Download, 
  XCircle, 
  Train, 
  Bus, 
  AlertCircle, 
  Clock, 
  CheckCircle,
  FileText
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const MyBookingsPage = () => {
  const { isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // PNR Search State
  const [searchPnr, setSearchPnr] = useState('');
  const [pnrResult, setPnrResult] = useState(null);
  const [pnrLoading, setPnrLoading] = useState(false);
  const [pnrError, setPnrError] = useState(null);

  const fetchMyBookings = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/bookings/my-bookings');
      setBookings(res.data.bookings || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load booking history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, [isAuthenticated]);

  const handlePnrSearch = async (e) => {
    e.preventDefault();
    if (!searchPnr.trim()) return;

    try {
      setPnrLoading(true);
      setPnrError(null);
      const res = await api.get(`/bookings/${searchPnr.trim().toUpperCase()}`);
      setPnrResult(res.data.booking);
    } catch (err) {
      setPnrError(err.response?.data?.message || 'PNR not found or invalid');
      setPnrResult(null);
    } finally {
      setPnrLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId, pnr) => {
    const reason = prompt(
      `Confirm cancellation for PNR: ${pnr}?\n\nStandard cancellation charges (₹120/seat for Train, ₹80/seat for Bus) will be deducted and remaining balance will be refunded in INR.`
    );
    if (reason === null) return; // User pressed Cancel

    try {
      const res = await api.post(`/bookings/${bookingId}/cancel`, {
        reason: reason || 'Customer requested online cancellation',
      });
      alert(
        `Cancellation Successful!\n\nPNR: ${res.data.cancellation.pnr}\nRefund Amount: ${res.data.cancellation.refundAmount}\nCharges Deducted: ${res.data.cancellation.cancellationCharges}`
      );
      fetchMyBookings();
      if (pnrResult && (pnrResult._id === bookingId || pnrResult.pnr === pnr)) {
        setPnrResult({ ...pnrResult, bookingStatus: 'CANCELLED' });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handleDownloadPDF = (bookingId, pnr) => {
    const downloadUrl = `${api.defaults.baseURL}/bookings/${bookingId}/ticket-pdf`;
    window.open(downloadUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FBF0E6] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Heading */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#407778] flex items-center gap-2.5">
              <CalendarCheck className="w-8 h-8 text-[#65AFB0]" />
              Manage Bookings & PNR Inquiry
            </h1>
            <p className="text-xs text-[#526D6E] mt-1">
              Check live reservation status, download electronic PDF boarding passes, and manage cancellations.
            </p>
          </div>
        </div>

        {/* PNR Quick Status Search Widget (Soft Peach #F7E1C9) */}
        <div className="bg-[#F7E1C9] border border-[#E8D5C2] rounded-3xl p-6 shadow-card max-w-3xl">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#407778] mb-2 flex items-center gap-1.5">
            <Ticket className="w-4 h-4 text-[#65AFB0]" />
            Instant PNR Status Check
          </h2>
          <form onSubmit={handlePnrSearch} className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              required
              value={searchPnr}
              onChange={(e) => setSearchPnr(e.target.value.toUpperCase())}
              placeholder="Enter 10-character PNR (e.g. RB78492019)"
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#FBF0E6] border border-[#D9C5B2] text-xs font-bold text-[#1D3536] uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#407778]/30"
            />
            <button
              type="submit"
              disabled={pnrLoading}
              className="px-6 py-2.5 rounded-xl bg-[#407778] hover:bg-[#346263] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              {pnrLoading ? 'Searching...' : 'Check Status'}
            </button>
          </form>

          {/* PNR Search Results Card */}
          {pnrError && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              {pnrError}
            </div>
          )}

          {pnrResult && (
            <div className="mt-4 bg-[#FBF0E6] border border-[#D9C5B2] rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#E8D5C2] pb-3">
                <div>
                  <div className="text-[11px] font-bold text-[#526D6E]">PNR: <span className="text-[#407778] text-base">{pnrResult.pnr}</span></div>
                  <div className="text-xs font-bold text-[#1D3536]">
                    {pnrResult.serviceType === 'train' ? pnrResult.schedule?.train?.trainName : pnrResult.schedule?.bus?.operatorName}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                    pnrResult.bookingStatus === 'CONFIRMED'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}>
                    {pnrResult.bookingStatus}
                  </span>

                  <button
                    onClick={() => handleDownloadPDF(pnrResult._id, pnrResult.pnr)}
                    className="p-2 rounded-xl bg-[#407778] hover:bg-[#346263] text-white text-xs flex items-center gap-1 transition-colors"
                    title="Download Ticket"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-[#526D6E] block text-[10px]">Origin:</span>
                  <span className="font-semibold text-[#1D3536]">{pnrResult.schedule?.route?.source}</span>
                </div>
                <div>
                  <span className="text-[#526D6E] block text-[10px]">Destination:</span>
                  <span className="font-semibold text-[#1D3536]">{pnrResult.schedule?.route?.destination}</span>
                </div>
                <div>
                  <span className="text-[#526D6E] block text-[10px]">Journey Date:</span>
                  <span className="font-semibold text-[#1D3536]">{pnrResult.journeyDate}</span>
                </div>
                <div>
                  <span className="text-[#526D6E] block text-[10px]">Fare Paid:</span>
                  <span className="font-bold text-[#407778]">₹{pnrResult.totalFare}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Customer's Booking History Section */}
        <div>
          <h2 className="text-xl font-bold text-[#407778] mb-4">
            My Travel Booking History
          </h2>

          {!isAuthenticated ? (
            <div className="bg-[#F7E1C9] border border-[#E8D5C2] rounded-3xl p-8 text-center space-y-3">
              <Ticket className="w-10 h-10 mx-auto text-[#65AFB0]" />
              <h3 className="text-base font-bold text-[#407778]">Sign in to View Your Personalized Bookings</h3>
              <p className="text-xs text-[#526D6E]">
                Log in to your RailBus account to view your bookings, download boarding passes, or initiate cancellations.
              </p>
              <div className="pt-2">
                <Link
                  to="/login?redirect=/my-bookings"
                  className="inline-flex px-6 py-2.5 rounded-xl bg-[#407778] text-white text-xs font-bold hover:bg-[#346263] transition-colors"
                >
                  Log In Now
                </Link>
              </div>
            </div>
          ) : loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#407778] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-medium text-[#526D6E]">Loading your travel reservations...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 text-center text-sm">
              <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-500" />
              {error}
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-[#F7E1C9] border border-[#E8D5C2] rounded-3xl p-10 text-center space-y-3">
              <CalendarCheck className="w-10 h-10 mx-auto text-[#65AFB0]" />
              <h3 className="text-base font-bold text-[#407778]">No Bookings Found</h3>
              <p className="text-xs text-[#526D6E]">
                You haven't booked any train or bus journeys yet. Explore our high-frequency routes to get started.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <Link
                  to="/trains"
                  className="px-5 py-2.5 rounded-xl bg-[#407778] text-white text-xs font-bold hover:bg-[#346263] transition-colors"
                >
                  Search Trains
                </Link>
                <Link
                  to="/buses"
                  className="px-5 py-2.5 rounded-xl bg-[#65AFB0] text-[#1D3536] text-xs font-bold hover:bg-[#579FA0] transition-colors"
                >
                  Search Buses
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div
                  key={b._id}
                  className="bg-[#F7E1C9] border border-[#E8D5C2] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#E8D5C2] pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#407778] text-white flex items-center justify-center font-bold">
                        {b.serviceType === 'train' ? <Train className="w-4 h-4" /> : <Bus className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#407778]">
                          {b.serviceType === 'train' ? b.schedule?.train?.trainName : b.schedule?.bus?.operatorName}
                        </div>
                        <div className="text-[11px] text-[#526D6E]">
                          PNR: <strong className="text-[#1D3536] tracking-wider">{b.pnr}</strong> • Booking ID: {b.bookingId}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        b.bookingStatus === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}>
                        {b.bookingStatus}
                      </span>
                      <span className="text-sm font-extrabold text-[#407778]">
                        ₹{b.totalFare} (INR)
                      </span>
                    </div>
                  </div>

                  {/* Journey & Passengers */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-8 bg-[#FBF0E6] rounded-2xl p-4 border border-[#E8D5C2] text-xs space-y-2">
                      <div className="flex justify-between items-center text-xs font-semibold text-[#1D3536]">
                        <span>{b.schedule?.route?.source} → {b.schedule?.route?.destination}</span>
                        <span className="text-[#526D6E]">{b.journeyDate} ({b.schedule?.departureTime})</span>
                      </div>
                      <div className="border-t border-[#E8D5C2] pt-2 text-[#526D6E]">
                        <strong>Passengers ({b.passengers.length}):</strong>{' '}
                        {b.passengers.map((p, idx) => (
                          <span key={idx} className="inline-block mr-3">
                            {p.name} (Seat {p.seatNumber})
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-4 flex flex-col gap-2">
                      <button
                        onClick={() => handleDownloadPDF(b._id, b.pnr)}
                        className="w-full py-2.5 rounded-xl bg-[#407778] hover:bg-[#346263] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                      >
                        <Download className="w-4 h-4" />
                        Download e-Ticket PDF
                      </button>

                      {b.bookingStatus === 'CONFIRMED' && (
                        <button
                          onClick={() => handleCancelBooking(b._id, b.pnr)}
                          className="w-full py-2.5 rounded-xl bg-transparent border border-red-400 text-red-700 hover:bg-red-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          Cancel Ticket
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MyBookingsPage;
