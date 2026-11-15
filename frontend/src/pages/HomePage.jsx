import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Train, 
  Bus, 
  Calendar, 
  MapPin, 
  ArrowRightLeft, 
  Search, 
  ShieldCheck, 
  Zap, 
  FileText, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Users
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('trains'); // 'trains' or 'buses'
  const [source, setSource] = useState('New Delhi');
  const [destination, setDestination] = useState('Mumbai Central');
  const [journeyDate, setJourneyDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [travelClass, setTravelClass] = useState('ALL');

  const handleSwapStations = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams({
      source,
      destination,
      date: journeyDate,
      class: travelClass
    }).toString();

    if (activeTab === 'trains') {
      navigate(`/trains?${query}`);
    } else {
      navigate(`/buses?${query}`);
    }
  };

  const popularRoutes = [
    {
      id: 'r1',
      type: 'train',
      name: 'Rajdhani Superfast Express (12952)',
      from: 'New Delhi (NDLS)',
      to: 'Mumbai Central (MMCT)',
      duration: '15h 30m',
      departure: '16:55',
      arrival: '08:25',
      price: '₹1,850',
      tag: 'Express Rail'
    },
    {
      id: 'r2',
      type: 'bus',
      name: 'Vande Bharat Sleeper Bus (VB-401)',
      from: 'Bengaluru (BLR)',
      to: 'Chennai Central (MAS)',
      duration: '06h 15m',
      departure: '22:30',
      arrival: '04:45',
      price: '₹950',
      tag: 'AC Luxury Multi-Axle'
    },
    {
      id: 'r3',
      type: 'train',
      name: 'Shatabdi Express (12002)',
      from: 'New Delhi (NDLS)',
      to: 'Bhopal Habibganj (BPL)',
      duration: '08h 20m',
      departure: '06:00',
      arrival: '14:20',
      price: '₹1,280',
      tag: 'Executive Chair'
    },
    {
      id: 'r4',
      type: 'bus',
      name: 'Royal Cruiser Intercity (RC-108)',
      from: 'Pune (PUN)',
      to: 'Goa Panaji (GOA)',
      duration: '09h 45m',
      departure: '21:00',
      arrival: '06:45',
      price: '₹1,100',
      tag: 'Volvo Sleeper 2+1'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBF0E6]">
      {/* ==================================================== */}
      {/* HERO SECTION                                         */}
      {/* Dominant Light Cream (#FBF0E6) with Deep Teal Titles */}
      {/* ==================================================== */}
      <section className="relative pt-10 pb-16 md:pt-16 md:pb-24 border-b border-[#E8D5C2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Title & Value Proposition */}
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F7E1C9] border border-[#E8D5C2] text-xs font-semibold text-[#407778]">
              <Sparkles className="w-3.5 h-3.5 text-[#65AFB0]" />
              Enterprise Transit Experience & Real-Time Seat Allocation
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#407778] tracking-tight leading-tight">
              Smarter Railway & Bus Journeys, <br />
              <span className="text-[#65AFB0]">Unified in One Clean Portal.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#526D6E] leading-relaxed">
              Experience seamless ticket reservations with interactive live seat maps, atomic lock concurrency protection, verified PNR generation, and instant e-ticket downloads.
            </p>
          </div>

          {/* ==================================================== */}
          {/* SEARCH BOOKING WIDGET                                */}
          {/* Soft Peach Card (#F7E1C9) on Light Cream background  */}
          {/* ==================================================== */}
          <div className="max-w-4xl mx-auto bg-[#F7E1C9] border border-[#E8D5C2] rounded-3xl p-6 sm:p-8 shadow-card">
            
            {/* Mode Switcher Tabs */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('trains')}
                className={`flex items-center gap-2.5 px-6 py-2.5 rounded-2xl font-semibold text-sm transition-all duration-200 ${
                  activeTab === 'trains'
                    ? 'bg-[#407778] text-white shadow-sm scale-102'
                    : 'bg-[#FBF0E6] text-[#407778] hover:bg-[#F2D4B6] border border-[#E8D5C2]'
                }`}
              >
                <Train className={`w-4 h-4 ${activeTab === 'trains' ? 'text-white' : 'text-[#65AFB0]'}`} />
                Book Train Tickets
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('buses')}
                className={`flex items-center gap-2.5 px-6 py-2.5 rounded-2xl font-semibold text-sm transition-all duration-200 ${
                  activeTab === 'buses'
                    ? 'bg-[#407778] text-white shadow-sm scale-102'
                    : 'bg-[#FBF0E6] text-[#407778] hover:bg-[#F2D4B6] border border-[#E8D5C2]'
                }`}
              >
                <Bus className={`w-4 h-4 ${activeTab === 'buses' ? 'text-white' : 'text-[#65AFB0]'}`} />
                Book Intercity Buses
              </button>
            </div>

            {/* Search Input Form */}
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                
                {/* Source Input */}
                <div className="md:col-span-4 relative">
                  <label className="block text-xs font-semibold text-[#407778] mb-1 uppercase tracking-wider">
                    From (Origin)
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#65AFB0]" />
                    <input
                      type="text"
                      required
                      list="home-stations-list"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      placeholder="Origin Station or City"
                      className="w-full pl-10 pr-3 py-3 rounded-xl bg-[#FBF0E6] border border-[#D9C5B2] text-[#1D3536] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#407778]/30 focus:border-[#407778]"
                    />
                  </div>
                </div>

                {/* Swap Icon Button */}
                <div className="md:col-span-1 flex justify-center -my-1 md:my-0">
                  <button
                    type="button"
                    onClick={handleSwapStations}
                    title="Swap Source and Destination"
                    className="w-10 h-10 rounded-full bg-[#65AFB0] text-white hover:bg-[#579FA0] flex items-center justify-center shadow-sm transition-transform hover:rotate-180 duration-300"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                </div>

                {/* Destination Input */}
                <div className="md:col-span-4 relative">
                  <label className="block text-xs font-semibold text-[#407778] mb-1 uppercase tracking-wider">
                    To (Destination)
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#65AFB0]" />
                    <input
                      type="text"
                      required
                      list="home-stations-list"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="Destination Station or City"
                      className="w-full pl-10 pr-3 py-3 rounded-xl bg-[#FBF0E6] border border-[#D9C5B2] text-[#1D3536] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#407778]/30 focus:border-[#407778]"
                    />
                  </div>
                </div>

                <datalist id="home-stations-list">
                  <option value="New Delhi" />
                  <option value="Mumbai Central" />
                  <option value="Chandigarh" />
                  <option value="Bengaluru" />
                  <option value="Chennai Central" />
                  <option value="Varanasi Cantt" />
                  <option value="Kolkata Howrah" />
                  <option value="Hyderabad" />
                  <option value="Pune" />
                  <option value="Jaipur" />
                  <option value="Bhopal Habibganj" />
                  <option value="Ahmedabad" />
                  <option value="Amritsar" />
                  <option value="Lucknow" />
                  <option value="Goa Panaji" />
                  <option value="Patna" />
                  <option value="Surat" />
                </datalist>

                {/* Date Picker */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-[#407778] mb-1 uppercase tracking-wider">
                    Date of Journey
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#65AFB0]" />
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={journeyDate}
                      onChange={(e) => setJourneyDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 rounded-xl bg-[#FBF0E6] border border-[#D9C5B2] text-[#1D3536] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#407778]/30 focus:border-[#407778]"
                    />
                  </div>
                </div>
              </div>

              {/* Lower Controls & Submit Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-xs font-semibold text-[#526D6E]">Class / Coach:</span>
                  <select
                    value={travelClass}
                    onChange={(e) => setTravelClass(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[#FBF0E6] border border-[#D9C5B2] text-xs font-medium text-[#1D3536] focus:outline-none focus:ring-2 focus:ring-[#407778]/20"
                  >
                    <option value="ALL">All Classes & Tiers</option>
                    <option value="1AC">1st AC Sleeper / Luxury</option>
                    <option value="2AC">2nd AC 2-Tier</option>
                    <option value="3AC">3rd AC 3-Tier</option>
                    <option value="CC">AC Chair Car</option>
                    <option value="SL">Sleeper Class</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-[#407778] hover:bg-[#346263] active:bg-[#2B5152] transition-all shadow-sm text-sm"
                >
                  <Search className="w-4 h-4" />
                  Search Available {activeTab === 'trains' ? 'Trains' : 'Buses'}
                </button>
              </div>
            </form>
          </div>

          {/* Reliability Trust Strip */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-[#FBF0E6] border border-[#E8D5C2] rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-[#407778]">100%</div>
              <div className="text-xs text-[#526D6E] font-medium mt-0.5">Atomic Seat Lock</div>
            </div>
            <div className="bg-[#FBF0E6] border border-[#E8D5C2] rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-[#407778]">420+</div>
              <div className="text-xs text-[#526D6E] font-medium mt-0.5">Daily Verified Routes</div>
            </div>
            <div className="bg-[#FBF0E6] border border-[#E8D5C2] rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-[#407778]">Instant</div>
              <div className="text-xs text-[#526D6E] font-medium mt-0.5">PDF Ticket & PNR</div>
            </div>
            <div className="bg-[#FBF0E6] border border-[#E8D5C2] rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-[#407778]">Zero</div>
              <div className="text-xs text-[#526D6E] font-medium mt-0.5">Double-Booking Risk</div>
            </div>
          </div>

        </div>
      </section>

      {/* ==================================================== */}
      {/* POPULAR ACTIVE ROUTES                                */}
      {/* Light Cream background with Soft Peach cards         */}
      {/* ==================================================== */}
      <section className="py-16 md:py-20 bg-[#FBF0E6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#65AFB0]">
                High-Frequency Corridors
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#407778] mt-1">
                Popular Railway & Bus Departures
              </h2>
            </div>
            <p className="text-sm text-[#526D6E] max-w-md mt-2 md:mt-0">
              Direct express connections with verified schedules, live seating inventory, and transparent pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {popularRoutes.map((route) => (
              <div
                key={route.id}
                className="bg-[#F7E1C9] border border-[#E8D5C2] rounded-2xl p-6 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#65AFB0]/20 text-[#407778] border border-[#65AFB0]/30">
                        {route.tag}
                      </span>
                      {route.type === 'train' ? (
                        <span className="text-xs text-[#526D6E] flex items-center gap-1 font-medium">
                          <Train className="w-3.5 h-3.5 text-[#407778]" /> Train Service
                        </span>
                      ) : (
                        <span className="text-xs text-[#526D6E] flex items-center gap-1 font-medium">
                          <Bus className="w-3.5 h-3.5 text-[#407778]" /> Bus Service
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-[#407778] group-hover:text-[#346263] transition-colors">
                      {route.name}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-[#526D6E] block">Starts at</span>
                    <span className="text-xl font-extrabold text-[#407778]">{route.price}</span>
                  </div>
                </div>

                {/* Timeline / Stops */}
                <div className="bg-[#FBF0E6] rounded-xl p-4 border border-[#E8D5C2] mb-5">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-bold text-[#407778] text-base">{route.departure}</div>
                      <div className="text-xs text-[#526D6E] font-medium">{route.from}</div>
                    </div>

                    <div className="flex flex-col items-center px-4">
                      <span className="text-[11px] font-semibold text-[#65AFB0] mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {route.duration}
                      </span>
                      <div className="w-24 h-0.5 bg-[#65AFB0]/40 relative flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#407778]"></div>
                      </div>
                      <span className="text-[10px] text-[#526D6E] mt-1">Direct Express</span>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-[#407778] text-base">{route.arrival}</div>
                      <div className="text-xs text-[#526D6E] font-medium">{route.to}</div>
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <button
                  onClick={() => navigate(route.type === 'train' ? '/trains' : '/buses')}
                  className="w-full py-2.5 rounded-xl bg-[#407778] hover:bg-[#346263] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  Select Journey & View Seats
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ==================================================== */}
      {/* SYSTEM ARCHITECTURE & VALUE HIGHLIGHTS               */}
      {/* Soft Peach Section for subtle visual rhythm          */}
      {/* ==================================================== */}
      <section className="py-16 md:py-24 bg-[#F7E1C9] border-t border-b border-[#E8D5C2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#407778] bg-[#FBF0E6] px-3 py-1 rounded-full border border-[#E8D5C2]">
              Engineered Quality
            </span>
            <h2 className="text-3xl font-extrabold text-[#407778]">
              Why Choose the RailBus Booking Engine?
            </h2>
            <p className="text-sm text-[#526D6E]">
              Designed following clean architecture patterns with concurrency-proof seat reservation algorithms and end-to-end automated testing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-[#FBF0E6] border border-[#E8D5C2] rounded-2xl p-7 shadow-sm hover:border-[#65AFB0] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#407778] text-white flex items-center justify-center mb-5 shadow-sm">
                <Zap className="w-6 h-6 text-[#F7E1C9]" />
              </div>
              <h3 className="text-lg font-bold text-[#407778] mb-2">
                Atomic Seat Lock Protection
              </h3>
              <p className="text-sm text-[#526D6E] leading-relaxed">
                Prevents double booking in high-traffic conditions using MongoDB atomic condition updates and temporary reservation hold expirations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#FBF0E6] border border-[#E8D5C2] rounded-2xl p-7 shadow-sm hover:border-[#65AFB0] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#65AFB0] text-[#1D3536] flex items-center justify-center mb-5 shadow-sm">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#407778] mb-2">
                Interactive Seating Layouts
              </h3>
              <p className="text-sm text-[#526D6E] leading-relaxed">
                Pick exact window, aisle, upper or lower berth seats interactively with instant color-coded visual feedback and fare calculation.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#FBF0E6] border border-[#E8D5C2] rounded-2xl p-7 shadow-sm hover:border-[#65AFB0] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#407778] text-white flex items-center justify-center mb-5 shadow-sm">
                <FileText className="w-6 h-6 text-[#F7E1C9]" />
              </div>
              <h3 className="text-lg font-bold text-[#407778] mb-2">
                Instant PDF e-Ticket & PNR
              </h3>
              <p className="text-sm text-[#526D6E] leading-relaxed">
                Generates verifiable 10-digit PNR codes and downloadable digital PDF boarding passes upon simulated payment completion.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ==================================================== */}
      {/* 4-STEP BOOKING WORKFLOW EXPLAINER                   */}
      {/* Light Cream background                              */}
      {/* ==================================================== */}
      <section className="py-16 md:py-20 bg-[#FBF0E6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#407778]">
              Four Simple Steps to Your Boarding Pass
            </h2>
            <p className="text-sm text-[#526D6E] mt-2">
              Fast, intuitive, and designed to minimize steps while maintaining security.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-[#F7E1C9]/60 border border-[#E8D5C2] rounded-2xl p-6 relative">
              <div className="w-8 h-8 rounded-full bg-[#407778] text-white font-bold text-sm flex items-center justify-center mb-4">
                1
              </div>
              <h4 className="font-bold text-[#407778] text-base mb-1">Search Route</h4>
              <p className="text-xs text-[#526D6E] leading-relaxed">
                Choose origin, destination, and journey date across trains and buses.
              </p>
            </div>

            <div className="bg-[#F7E1C9]/60 border border-[#E8D5C2] rounded-2xl p-6 relative">
              <div className="w-8 h-8 rounded-full bg-[#65AFB0] text-white font-bold text-sm flex items-center justify-center mb-4">
                2
              </div>
              <h4 className="font-bold text-[#407778] text-base mb-1">Pick Your Seat</h4>
              <p className="text-xs text-[#526D6E] leading-relaxed">
                Interactive real-time layout allows choosing window, berth, or aisle seats.
              </p>
            </div>

            <div className="bg-[#F7E1C9]/60 border border-[#E8D5C2] rounded-2xl p-6 relative">
              <div className="w-8 h-8 rounded-full bg-[#407778] text-white font-bold text-sm flex items-center justify-center mb-4">
                3
              </div>
              <h4 className="font-bold text-[#407778] text-base mb-1">Simulated Checkout</h4>
              <p className="text-xs text-[#526D6E] leading-relaxed">
                Enter passenger details and complete instantaneous sandbox test payment.
              </p>
            </div>

            <div className="bg-[#F7E1C9]/60 border border-[#E8D5C2] rounded-2xl p-6 relative">
              <div className="w-8 h-8 rounded-full bg-[#65AFB0] text-white font-bold text-sm flex items-center justify-center mb-4">
                4
              </div>
              <h4 className="font-bold text-[#407778] text-base mb-1">Download e-Ticket</h4>
              <p className="text-xs text-[#526D6E] leading-relaxed">
                Instant PNR generation with print-ready PDF boarding pass & cancellation options.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ==================================================== */}
      {/* CALL TO ACTION                                       */}
      {/* Deep Teal Banner with Soft Peach and White           */}
      {/* ==================================================== */}
      <section className="py-12 bg-[#FBF0E6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#407778] rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-elevated">
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Ready to Experience Seamless Travel Booking?
              </h2>
              <p className="text-sm sm:text-base text-[#F7E1C9] leading-relaxed">
                Discover modern railway schedules, luxury intercity coaches, and real-time seat inventory powered by our enterprise REST backend.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={() => navigate('/trains')}
                  className="px-6 py-3 rounded-xl font-bold text-[#1D3536] bg-[#F7E1C9] hover:bg-[#F2D4B6] transition-all text-sm shadow-sm"
                >
                  Explore Train Schedules
                </button>
                <button
                  onClick={() => navigate('/buses')}
                  className="px-6 py-3 rounded-xl font-bold text-white bg-[#65AFB0] hover:bg-[#579FA0] transition-all text-sm shadow-sm"
                >
                  Explore Bus Schedules
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
