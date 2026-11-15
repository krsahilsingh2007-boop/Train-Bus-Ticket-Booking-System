import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  Train, 
  Bus, 
  Ticket, 
  DollarSign, 
  AlertCircle,
  Plus,
  Trash2,
  Calendar
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [trains, setTrains] = useState([]);
  const [buses, setBuses] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'trains', 'buses', 'bookings'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashRes, trainsRes, busesRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/trains'),
        api.get('/admin/buses'),
      ]);

      setStats(dashRes.data.stats);
      setRecentBookings(dashRes.data.recentBookings || []);
      setTrains(trainsRes.data.trains || []);
      setBuses(busesRes.data.buses || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch administrator records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin]);

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-[70vh] bg-[#FBF0E6] flex items-center justify-center p-4">
        <div className="bg-[#F7E1C9] border border-[#E8D5C2] rounded-3xl p-8 max-w-md text-center space-y-4 shadow-card">
          <ShieldCheck className="w-12 h-12 text-[#407778] mx-auto" />
          <h2 className="text-xl font-extrabold text-[#407778]">Administrator Access Required</h2>
          <p className="text-xs text-[#526D6E]">
            This portal is restricted to authorized operations staff. Please sign in with administrator credentials.
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-2.5 rounded-xl bg-[#407778] text-white text-xs font-bold hover:bg-[#346263]"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  const handleDeleteTrain = async (id, trainName) => {
    if (!window.confirm(`Are you sure you want to delete train: ${trainName}?`)) return;
    try {
      await api.delete(`/admin/trains/${id}`);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleDeleteBus = async (id, operatorName) => {
    if (!window.confirm(`Are you sure you want to delete bus: ${operatorName}?`)) return;
    try {
      await api.delete(`/admin/buses/${id}`);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF0E6] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-[#65AFB0]/30 text-[#407778] border border-[#65AFB0]/40">
                Staff Operations Portal
              </span>
              <span className="text-xs text-[#526D6E]">Logged in as {user?.name}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#407778] mt-1">
              Admin Analytics & Fleet Management
            </h1>
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#F7E1C9] border border-[#E8D5C2] text-[#407778] hover:bg-[#F2D4B6] transition-colors"
            >
              Refresh Metrics
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Analytics Statistic Cards in INR (₹) */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-[#F7E1C9] border border-[#E8D5C2] rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#526D6E]">
                Gross Booking Revenue
              </span>
              <div className="text-2xl font-black text-[#407778] mt-1">
                {stats.formattedRevenue}
              </div>
              <span className="text-[10px] text-[#526D6E] block mt-0.5">INR (All Confirmed Tickets)</span>
            </div>

            <div className="bg-[#F7E1C9] border border-[#E8D5C2] rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#526D6E]">
                Total Bookings
              </span>
              <div className="text-2xl font-black text-[#407778] mt-1">
                {stats.totalBookings}
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                Active Reservations
              </span>
            </div>

            <div className="bg-[#F7E1C9] border border-[#E8D5C2] rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#526D6E]">
                Active Rail & Bus Fleet
              </span>
              <div className="text-2xl font-black text-[#407778] mt-1">
                {stats.totalTrains + stats.totalBuses} Units
              </div>
              <span className="text-[10px] text-[#526D6E] block mt-0.5">
                {stats.totalTrains} Trains • {stats.totalBuses} Coaches
              </span>
            </div>

            <div className="bg-[#F7E1C9] border border-[#E8D5C2] rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#526D6E]">
                Cancellations Processed
              </span>
              <div className="text-2xl font-black text-[#407778] mt-1">
                {stats.totalCancellations}
              </div>
              <span className="text-[10px] text-[#526D6E] block mt-0.5">Automated Refund Handled</span>
            </div>

          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-[#E8D5C2] pb-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-[#407778] text-white shadow-sm'
                : 'bg-[#F7E1C9] text-[#407778] hover:bg-[#F2D4B6]'
            }`}
          >
            Recent Bookings Log
          </button>
          <button
            onClick={() => setActiveTab('trains')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'trains'
                ? 'bg-[#407778] text-white shadow-sm'
                : 'bg-[#F7E1C9] text-[#407778] hover:bg-[#F2D4B6]'
            }`}
          >
            <Train className="w-3.5 h-3.5" />
            Manage Trains ({trains.length})
          </button>
          <button
            onClick={() => setActiveTab('buses')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'buses'
                ? 'bg-[#407778] text-white shadow-sm'
                : 'bg-[#F7E1C9] text-[#407778] hover:bg-[#F2D4B6]'
            }`}
          >
            <Bus className="w-3.5 h-3.5" />
            Manage Buses ({buses.length})
          </button>
        </div>

        {/* Tab 1: Recent Bookings Table */}
        {activeTab === 'overview' && (
          <div className="bg-[#F7E1C9] border border-[#E8D5C2] rounded-3xl p-6 shadow-sm overflow-hidden">
            <h2 className="text-base font-bold text-[#407778] mb-4">
              Real-Time Customer Bookings Stream
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#407778] text-white">
                    <th className="p-3 rounded-l-xl">PNR / ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Service</th>
                    <th className="p-3">Journey Date</th>
                    <th className="p-3">Fare Paid</th>
                    <th className="p-3 rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8D5C2]">
                  {recentBookings.map((b) => (
                    <tr key={b._id} className="hover:bg-white/40 transition-colors">
                      <td className="p-3 font-bold text-[#407778]">{b.pnr}</td>
                      <td className="p-3 font-medium text-[#1D3536]">{b.user?.name || 'Customer'}</td>
                      <td className="p-3 font-semibold uppercase">{b.serviceType}</td>
                      <td className="p-3 text-[#526D6E]">{b.journeyDate}</td>
                      <td className="p-3 font-bold text-[#1D3536]">₹{b.totalFare}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          b.bookingStatus === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {b.bookingStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Trains Table */}
        {activeTab === 'trains' && (
          <div className="bg-[#F7E1C9] border border-[#E8D5C2] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-[#407778]">Train Fleet Directory</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#407778] text-white">
                    <th className="p-3 rounded-l-xl">Train Number</th>
                    <th className="p-3">Train Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Coaches</th>
                    <th className="p-3">Supported Classes</th>
                    <th className="p-3 rounded-r-xl text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8D5C2]">
                  {trains.map((t) => (
                    <tr key={t._id} className="hover:bg-white/40 transition-colors">
                      <td className="p-3 font-bold text-[#407778]">{t.trainNumber}</td>
                      <td className="p-3 font-semibold text-[#1D3536]">{t.trainName}</td>
                      <td className="p-3 text-[#526D6E]">{t.trainType}</td>
                      <td className="p-3 font-medium">{t.totalCoaches}</td>
                      <td className="p-3">{t.classesSupported?.join(', ')}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteTrain(t._id, t.trainName)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Train"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Buses Table */}
        {activeTab === 'buses' && (
          <div className="bg-[#F7E1C9] border border-[#E8D5C2] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-[#407778]">Bus Fleet Directory</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#407778] text-white">
                    <th className="p-3 rounded-l-xl">Registration</th>
                    <th className="p-3">Operator Name</th>
                    <th className="p-3">Coach Type</th>
                    <th className="p-3">Total Seats</th>
                    <th className="p-3 rounded-r-xl text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8D5C2]">
                  {buses.map((b) => (
                    <tr key={b._id} className="hover:bg-white/40 transition-colors">
                      <td className="p-3 font-bold text-[#407778]">{b.busNumber}</td>
                      <td className="p-3 font-semibold text-[#1D3536]">{b.operatorName}</td>
                      <td className="p-3 text-[#526D6E]">{b.busType}</td>
                      <td className="p-3 font-medium">{b.totalSeats} Seats</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteBus(b._id, b.operatorName)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Bus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
