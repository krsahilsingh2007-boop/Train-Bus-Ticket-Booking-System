import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Train, Bus, User, LogOut, ShieldCheck, Menu, X, CalendarCheck, Ticket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-[#407778] text-white shadow-md sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 py-3">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#FBF0E6] flex items-center justify-center text-[#407778] shadow-sm group-hover:scale-105 transition-transform">
              <Ticket className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                RailBus <span className="text-[#65AFB0] text-xs px-2 py-0.5 rounded-full bg-white/10 font-medium">Enterprise</span>
              </div>
              <p className="text-[11px] text-[#F7E1C9] font-normal leading-none tracking-wide">Railway & Bus Booking System</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive('/') 
                  ? 'bg-white/15 text-white shadow-inner font-semibold' 
                  : 'text-[#FBF0E6]/90 hover:text-white hover:bg-white/10'
              }`}
            >
              Home
            </Link>

            <Link
              to="/trains"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                isActive('/trains') 
                  ? 'bg-white/15 text-white shadow-inner font-semibold' 
                  : 'text-[#FBF0E6]/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <Train className="w-4 h-4 text-[#65AFB0]" />
              Trains
            </Link>

            <Link
              to="/buses"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                isActive('/buses') 
                  ? 'bg-white/15 text-white shadow-inner font-semibold' 
                  : 'text-[#FBF0E6]/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <Bus className="w-4 h-4 text-[#65AFB0]" />
              Buses
            </Link>

            <Link
              to="/my-bookings"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                isActive('/my-bookings') 
                  ? 'bg-white/15 text-white shadow-inner font-semibold' 
                  : 'text-[#FBF0E6]/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <CalendarCheck className="w-4 h-4 text-[#65AFB0]" />
              My Bookings
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium flex items-center gap-2 bg-[#65AFB0]/30 border border-[#65AFB0]/40 text-white hover:bg-[#65AFB0]/40 transition-all ${
                  isActive('/admin') ? 'ring-2 ring-white/30' : ''
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-[#F7E1C9]" />
                Admin Panel
              </Link>
            )}
          </div>

          {/* Desktop Right Action / Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 transition-all text-sm font-medium text-white border border-white/10"
                >
                  <div className="w-7 h-7 rounded-full bg-[#65AFB0] text-[#1D3536] flex items-center justify-center font-bold text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[120px] truncate">{user?.name || 'My Account'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 rounded-xl text-[#FBF0E6]/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-[#1D3536] bg-[#65AFB0] hover:bg-[#579FA0] shadow-sm transition-all hover:scale-[1.02]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#FBF0E6] hover:bg-white/10 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#346263] border-t border-white/10 px-4 pt-3 pb-5 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-base font-medium text-white hover:bg-white/10"
          >
            Home
          </Link>
          <Link
            to="/trains"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-medium text-white hover:bg-white/10"
          >
            <Train className="w-5 h-5 text-[#65AFB0]" />
            Trains
          </Link>
          <Link
            to="/buses"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-medium text-white hover:bg-white/10"
          >
            <Bus className="w-5 h-5 text-[#65AFB0]" />
            Buses
          </Link>
          <Link
            to="/my-bookings"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-medium text-white hover:bg-white/10"
          >
            <CalendarCheck className="w-5 h-5 text-[#65AFB0]" />
            My Bookings
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-medium text-[#F7E1C9] bg-white/10"
            >
              <ShieldCheck className="w-5 h-5 text-[#65AFB0]" />
              Admin Dashboard
            </Link>
          )}

          <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-medium text-white hover:bg-white/10"
                >
                  <User className="w-5 h-5 text-[#65AFB0]" />
                  Profile ({user?.name})
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-medium text-red-200 hover:bg-white/10 w-full text-left"
                >
                  <LogOut className="w-5 h-5" />
                  Log Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl text-sm font-semibold border border-[#FBF0E6]/30 text-white hover:bg-white/10"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl text-sm font-semibold text-[#1D3536] bg-[#65AFB0] hover:bg-[#579FA0]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
