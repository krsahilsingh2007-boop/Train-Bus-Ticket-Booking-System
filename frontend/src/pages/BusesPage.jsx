import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Bus, 
  MapPin, 
  Calendar, 
  Search, 
  Clock, 
  Armchair, 
  ArrowRightLeft,
  Shield,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import SeatMapModal from '../components/SeatMapModal';
import CheckoutModal from '../components/CheckoutModal';
import { useAuth } from '../context/AuthContext';

const BusesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [source, setSource] = useState(searchParams.get('source') || 'Bengaluru');
  const [destination, setDestination] = useState(searchParams.get('destination') || 'Chennai Central');
  const [journeyDate, setJourneyDate] = useState(
    searchParams.get('date') || new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [activeSeatSchedule, setActiveSeatSchedule] = useState(null);
  const [checkoutData, setCheckoutData] = useState(null);

  const fetchBuses = async (s = source, d = destination, dt = journeyDate) => {
    try {
      setLoading(true);
      const res = await api.get('/buses/search', {
        params: {
          source: s,
          destination: d,
          date: dt,
        },
      });
      setBuses(res.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve bus services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const s = searchParams.get('source') || 'Bengaluru';
    const d = searchParams.get('destination') || 'Chennai Central';
    const dt = searchParams.get('date') || new Date(Date.now() + 86400000).toISOString().split('T')[0];

    setSource(s);
    setDestination(d);
    setJourneyDate(dt);

    fetchBuses(s, d, dt);
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({
      source,
      destination,
      date: journeyDate,
    });
  };

  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  const handleOpenSeatMap = (busItem) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/buses');
      return;
    }
    setActiveSeatSchedule({
      scheduleId: busItem.scheduleId,
      name: busItem.bus.operatorName,
      number: busItem.bus.busNumber,
      serviceType: 'bus',
      journeyDate: busItem.journeyDate,
      route: busItem.route,
    });
  };

  const handleSeatProceed = (selectedSeats, totalFare, fareSummary) => {
    setActiveSeatSchedule(null);
    setCheckoutData({
      scheduleId: activeSeatSchedule.scheduleId,
      scheduleInfo: activeSeatSchedule,
      selectedSeats,
      fareSummary,
    });
  };

  return (
    <div className="min-h-screen bg-[#FBF0E6] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Search Bar Strip (Soft Peach #F7E1C9) */}
        <div className="bg-[#F7E1C9] border border-[#E8D5C2] rounded-3xl p-5 mb-8 shadow-card">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            <div className="md:col-span-4 relative">
              <label className="block text-[11px] font-bold text-[#407778] uppercase mb-1">
                From City
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#65AFB0]" />
                <input
                  type="text"
                  required
                  list="bus-cities-list"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="Origin City"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#FBF0E6] border border-[#D9C5B2] text-xs font-semibold text-[#1D3536] focus:outline-none focus:ring-2 focus:ring-[#407778]/30"
                />
              </div>
            </div>

            <div className="md:col-span-1 flex justify-center -my-1 md:my-0">
              <button
                type="button"
                onClick={handleSwap}
                className="w-8 h-8 rounded-full bg-[#65AFB0] text-white flex items-center justify-center hover:bg-[#579FA0] shadow-sm transition-transform hover:rotate-180"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="md:col-span-4 relative">
              <label className="block text-[11px] font-bold text-[#407778] uppercase mb-1">
                To City
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#65AFB0]" />
                <input
                  type="text"
                  required
                  list="bus-cities-list"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Destination City"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#FBF0E6] border border-[#D9C5B2] text-xs font-semibold text-[#1D3536] focus:outline-none focus:ring-2 focus:ring-[#407778]/30"
                />
              </div>
            </div>

            <datalist id="bus-cities-list">
              <option value="Bengaluru" />
              <option value="Chennai Central" />
              <option value="Pune" />
              <option value="Goa Panaji" />
              <option value="Mumbai" />
              <option value="Hyderabad" />
              <option value="Chandigarh" />
              <option value="New Delhi" />
              <option value="Jaipur" />
              <option value="Varanasi" />
              <option value="Kolkata" />
              <option value="Ahmedabad" />
              <option value="Surat" />
              <option value="Lucknow" />
              <option value="Agra" />
              <option value="Amritsar" />
            </datalist>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-[#407778] uppercase mb-1">
                Travel Date
              </label>
              <input
                type="date"
                required
                value={journeyDate}
                onChange={(e) => setJourneyDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#FBF0E6] border border-[#D9C5B2] text-xs font-semibold text-[#1D3536] focus:outline-none focus:ring-2 focus:ring-[#407778]/30"
              />
            </div>

            <div className="md:col-span-1 pt-4 md:pt-0">
              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-[#407778] hover:bg-[#346263] text-white font-bold text-xs flex items-center justify-center shadow-sm transition-colors"
                title="Search Buses"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

          </form>
        </div>

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-[#407778] flex items-center gap-2">
              <Bus className="w-6 h-6 text-[#65AFB0]" />
              Intercity Bus Departures ({buses.length})
            </h1>
            <p className="text-xs text-[#526D6E]">
              Route: <span className="font-semibold text-[#1D3536]">{source}</span> ⇄ <span className="font-semibold text-[#1D3536]">{destination}</span> • {journeyDate}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#407778] bg-[#F7E1C9] px-3 py-1.5 rounded-xl border border-[#E8D5C2]">
            <Shield className="w-4 h-4 text-[#65AFB0]" />
            RedBus Verified Premium Coaches
          </div>
        </div>

        {/* Results List */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-[#407778] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-medium text-[#526D6E]">Searching available bus schedules...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 text-center text-sm">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-500" />
            {error}
          </div>
        ) : buses.length === 0 ? (
          <div className="bg-[#F7E1C9] border border-[#E8D5C2] rounded-3xl p-12 text-center space-y-4">
            <Bus className="w-12 h-12 mx-auto text-[#65AFB0] stroke-[1.5]" />
            <h3 className="text-lg font-bold text-[#407778]">No Bus Services Found</h3>
            <p className="text-xs text-[#526D6E] max-w-md mx-auto">
              No active buses found between {source} and {destination} on {journeyDate}. Try searching for <strong>Bengaluru</strong> to <strong>Chennai Central</strong> or <strong>Pune</strong> to <strong>Goa Panaji</strong>.
            </p>
            <button
              onClick={() => {
                setSource('Bengaluru');
                setDestination('Chennai Central');
                setSearchParams({ source: 'Bengaluru', destination: 'Chennai Central', date: journeyDate });
              }}
              className="px-5 py-2.5 rounded-xl bg-[#407778] text-white text-xs font-bold hover:bg-[#346263] transition-colors"
            >
              Search Bengaluru ⇄ Chennai
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {buses.map((item) => (
              <div
                key={item.scheduleId}
                className="bg-[#F7E1C9] border border-[#E8D5C2] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group"
              >
                {/* Bus Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-4 border-b border-[#E8D5C2]">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#407778] text-white">
                        {item.bus.busNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#65AFB0]/20 text-[#407778] border border-[#65AFB0]/30">
                        {item.bus.busType}
                      </span>
                    </div>
                    <h2 className="text-xl font-extrabold text-[#407778] group-hover:text-[#346263] transition-colors">
                      {item.bus.operatorName}
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {item.bus.amenities.slice(0, 3).map((amenity, idx) => (
                      <span key={idx} className="text-[10px] font-semibold bg-[#FBF0E6] px-2.5 py-1 rounded-lg text-[#526D6E] border border-[#E8D5C2]">
                        ✓ {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Timeline Strip */}
                <div className="py-5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-4">
                    <div className="text-2xl font-black text-[#407778]">{item.departureTime}</div>
                    <div className="text-xs font-semibold text-[#1D3536] mt-0.5">{item.route.source}</div>
                    <div className="text-[11px] text-[#526D6E]">{item.journeyDate}</div>
                  </div>

                  <div className="sm:col-span-4 flex flex-col items-center">
                    <span className="text-[11px] font-bold text-[#65AFB0] flex items-center gap-1 mb-1">
                      <Clock className="w-3.5 h-3.5" /> {item.duration}
                    </span>
                    <div className="w-full max-w-[140px] h-0.5 bg-[#65AFB0]/40 relative flex items-center justify-between">
                      <div className="w-2 h-2 rounded-full bg-[#407778]"></div>
                      <div className="w-2 h-2 rounded-full bg-[#407778]"></div>
                    </div>
                    <span className="text-[10px] text-[#526D6E] mt-1">{item.distanceKm} km Intercity Highway</span>
                  </div>

                  <div className="sm:col-span-4 text-left sm:text-right">
                    <div className="text-2xl font-black text-[#407778]">{item.arrivalTime}</div>
                    <div className="text-xs font-semibold text-[#1D3536] mt-0.5">{item.route.destination}</div>
                    <div className="text-[11px] text-[#526D6E]">Early Morning Arrival</div>
                  </div>
                </div>

                {/* Pricing & Seat Availability in INR (₹) */}
                <div className="bg-[#FBF0E6] rounded-2xl p-4 border border-[#E8D5C2] flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-[#1D3536]">
                    <div className="bg-white/90 border border-[#D9C5B2] rounded-xl px-3.5 py-2">
                      <span className="text-[#526D6E] block text-[10px]">Upper Sleeper</span>
                      <span className="font-extrabold text-sm text-[#407778]">₹{item.fares?.Sleeper || 1050}</span>
                      <span className="text-emerald-700 text-[10px] block font-bold">{item.sleeperAvailable} Left</span>
                    </div>

                    <div className="bg-white/90 border border-[#D9C5B2] rounded-xl px-3.5 py-2">
                      <span className="text-[#526D6E] block text-[10px]">Lower Seater</span>
                      <span className="font-extrabold text-sm text-[#407778]">₹{item.fares?.['Semi-Sleeper'] || 750}</span>
                      <span className="text-emerald-700 text-[10px] block font-bold">{item.seaterAvailable} Left</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenSeatMap(item)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs bg-[#407778] hover:bg-[#346263] text-white flex items-center justify-center gap-2 transition-all shadow-sm group-hover:scale-102"
                  >
                    <Armchair className="w-4 h-4 text-[#F7E1C9]" />
                    Select Bus Seats & Book
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* Seat Map Modal */}
      {activeSeatSchedule && (
        <SeatMapModal
          scheduleId={activeSeatSchedule.scheduleId}
          scheduleInfo={activeSeatSchedule}
          onClose={() => setActiveSeatSchedule(null)}
          onProceed={handleSeatProceed}
        />
      )}

      {/* Checkout Modal */}
      {checkoutData && (
        <CheckoutModal
          scheduleId={checkoutData.scheduleId}
          scheduleInfo={checkoutData.scheduleInfo}
          selectedSeats={checkoutData.selectedSeats}
          fareSummary={checkoutData.fareSummary}
          onClose={() => setCheckoutData(null)}
          onBookingSuccess={() => {
            fetchBuses();
          }}
        />
      )}

    </div>
  );
};

export default BusesPage;
