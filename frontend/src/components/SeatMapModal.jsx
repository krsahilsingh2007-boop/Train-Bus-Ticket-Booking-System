import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Info, Armchair, ChevronRight } from 'lucide-react';
import api from '../services/api';

const SeatMapModal = ({ scheduleId, scheduleInfo, onClose, onProceed }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seatData, setSeatData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [activeDeck, setActiveDeck] = useState('');

  useEffect(() => {
    const fetchSeatLayout = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/seats/${scheduleId}`);
        setSeatData(res.data);
        const deckKeys = Object.keys(res.data.decks || {});
        if (deckKeys.length > 0) {
          setActiveDeck(deckKeys[0]);
        }
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch live seating layout');
      } finally {
        setLoading(false);
      }
    };

    if (scheduleId) {
      fetchSeatLayout();
    }
  }, [scheduleId]);

  const handleSeatClick = (seat) => {
    if (seat.status !== 'available') return;

    const isAlreadySelected = selectedSeats.some((s) => s.seatNumber === seat.seatNumber);

    if (isAlreadySelected) {
      setSelectedSeats(selectedSeats.filter((s) => s.seatNumber !== seat.seatNumber));
    } else {
      if (selectedSeats.length >= 6) {
        alert('You can select a maximum of 6 seats per transaction.');
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const calculateTotal = () => {
    const base = selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0);
    const platformFee = selectedSeats.length > 0 ? 35 : 0;
    const gst = Math.round(base * 0.05);
    return {
      base,
      platformFee,
      gst,
      total: Math.round(base + platformFee + gst),
    };
  };

  const fareDetails = calculateTotal();

  const handleConfirm = () => {
    if (selectedSeats.length === 0) return;
    onProceed(selectedSeats, fareDetails.total, fareDetails);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D3536]/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#FBF0E6] border border-[#E8D5C2] rounded-3xl max-w-3xl w-full shadow-elevated overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#407778] text-white px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#65AFB0]/30 border border-[#65AFB0]/40 font-semibold">
                {scheduleInfo?.serviceType === 'train' ? 'Train Coach View' : 'Intercity Bus Seating'}
              </span>
              <span className="text-xs text-[#F7E1C9]">{scheduleInfo?.journeyDate}</span>
            </div>
            <h2 className="text-lg font-bold mt-1 text-white">
              {scheduleInfo?.name || seatData?.title} ({scheduleInfo?.number || seatData?.number})
            </h2>
            <p className="text-xs text-[#FBF0E6]/80">
              {scheduleInfo?.route?.source || 'Origin'} → {scheduleInfo?.route?.destination || 'Destination'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-[#407778] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm font-medium text-[#526D6E]">Loading verified seat inventory from MongoDB...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center text-red-700 text-sm">
              <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-500" />
              {error}
            </div>
          ) : (
            <>
              {/* Legend */}
              <div className="bg-[#F7E1C9] border border-[#E8D5C2] rounded-2xl p-4 flex flex-wrap items-center justify-around gap-3 text-xs font-semibold text-[#1D3536]">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-lg bg-[#FBF0E6] border-2 border-[#65AFB0]"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-lg bg-[#407778] border-2 border-[#407778] text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-lg bg-gray-300 border-2 border-gray-400"></div>
                  <span>Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-lg bg-amber-200 border-2 border-amber-400"></div>
                  <span>Hold (10m)</span>
                </div>
              </div>

              {/* Deck / Coach Selector Tabs */}
              {seatData?.decks && Object.keys(seatData.decks).length > 1 && (
                <div className="flex gap-2 border-b border-[#E8D5C2] pb-3">
                  {Object.keys(seatData.decks).map((deckName) => (
                    <button
                      key={deckName}
                      onClick={() => setActiveDeck(deckName)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        activeDeck === deckName
                          ? 'bg-[#407778] text-white shadow-sm'
                          : 'bg-[#F7E1C9] text-[#407778] hover:bg-[#F2D4B6]'
                      }`}
                    >
                      {deckName}
                    </button>
                  ))}
                </div>
              )}

              {/* 2D Interactive Seat Grid */}
              <div className="bg-white/80 border border-[#E8D5C2] rounded-2xl p-6 shadow-sm">
                <div className="text-center text-xs font-bold uppercase tracking-wider text-[#526D6E] mb-4 pb-2 border-b border-dashed border-[#E8D5C2] flex items-center justify-center gap-2">
                  <span>Front of Vehicle / Engine Direction</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {seatData?.decks[activeDeck]?.map((seat) => {
                    const isSelected = selectedSeats.some((s) => s.seatNumber === seat.seatNumber);
                    const isBooked = seat.status === 'booked';
                    const isReserved = seat.status === 'reserved';

                    return (
                      <button
                        key={seat.seatNumber}
                        type="button"
                        disabled={isBooked || (isReserved && !seat.isMyReservation)}
                        onClick={() => handleSeatClick(seat)}
                        className={`p-3 rounded-xl border-2 text-left transition-all duration-150 relative ${
                          isSelected
                            ? 'bg-[#407778] border-[#407778] text-white shadow-md scale-102 ring-2 ring-[#65AFB0]'
                            : isBooked
                            ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed opacity-60'
                            : isReserved
                            ? 'bg-amber-100 border-amber-300 text-amber-700 cursor-not-allowed opacity-75'
                            : 'bg-[#FBF0E6] border-[#D9C5B2] hover:border-[#65AFB0] text-[#1D3536] hover:bg-[#F7E1C9]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm">{seat.seatNumber}</span>
                          <Armchair className="w-4 h-4 opacity-75" />
                        </div>
                        <div className="text-[11px] mt-1 font-medium truncate opacity-90">
                          {seat.berthType}
                        </div>
                        <div className="text-xs font-extrabold mt-1">
                          ₹{seat.price}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selection Summary */}
              {selectedSeats.length > 0 && (
                <div className="bg-[#F7E1C9] border border-[#E8D5C2] rounded-2xl p-4 text-sm text-[#1D3536] space-y-2">
                  <div className="flex justify-between items-center font-bold">
                    <span>Selected Seats ({selectedSeats.length}):</span>
                    <span className="text-[#407778]">
                      {selectedSeats.map((s) => s.seatNumber).join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-[#526D6E]">
                    <span>Base Ticket Fare:</span>
                    <span>₹{fareDetails.base}</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#526D6E]">
                    <span>IRCTC / Platform Fee:</span>
                    <span>₹{fareDetails.platformFee}</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#526D6E]">
                    <span>Transit GST (5%):</span>
                    <span>₹{fareDetails.gst}</span>
                  </div>
                  <div className="pt-2 border-t border-[#D9C5B2] flex justify-between items-center font-extrabold text-base text-[#407778]">
                    <span>Total Amount (INR):</span>
                    <span className="text-xl">₹{fareDetails.total}</span>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-[#F7E1C9]/50 border-t border-[#E8D5C2] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#526D6E] flex items-center gap-1.5">
            <Info className="w-4 h-4 text-[#65AFB0]" />
            Maximum 6 seats per transaction. All fares are in Indian Rupees (₹).
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-semibold text-xs border border-[#407778] text-[#407778] hover:bg-[#407778]/10 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={selectedSeats.length === 0}
              onClick={handleConfirm}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#407778] hover:bg-[#346263] text-white flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proceed to Passenger Details ({selectedSeats.length})
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SeatMapModal;
