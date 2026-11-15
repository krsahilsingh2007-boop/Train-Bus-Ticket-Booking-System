import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Ticket, Mail, Lock, LogIn, AlertCircle, Sparkles, Check, User, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  // Pre-fill default temporary credentials as requested
  const [email, setEmail] = useState('customer@railbus.com');
  const [password, setPassword] = useState('Customer@123');
  const [activeRole, setActiveRole] = useState('customer'); // 'customer' or 'admin'
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  // If already logged in, redirect to homepage
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectUrl, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectUrl]);

  const selectRoleCredentials = (role) => {
    setActiveRole(role);
    if (role === 'admin') {
      setEmail('admin@railbus.com');
      setPassword('Admin@123');
    } else {
      setEmail('customer@railbus.com');
      setPassword('Customer@123');
    }
    setError(null);
  };

  const performLogin = async (targetEmail, targetPassword) => {
    setError(null);
    setLoading(true);

    const cleanEmail = (targetEmail !== undefined ? targetEmail : email).trim().toLowerCase();
    const cleanPassword = (targetPassword !== undefined ? targetPassword : password).trim();

    try {
      const res = await api.post('/auth/login', { email: cleanEmail, password: cleanPassword });
      login(res.data.user, res.data.token);
      if (res.data.user?.role === 'admin' && redirectUrl === '/') {
        navigate('/admin');
      } else {
        navigate(redirectUrl);
      }
    } catch (err) {
      console.error('Login error:', err);
      let message = 'Invalid email or password credentials';
      if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        message = 'Unable to connect to backend server at http://localhost:5000. Please check server status.';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await performLogin();
  };

  const handleQuickLogin = (role) => {
    if (role === 'admin') {
      setEmail('admin@railbus.com');
      setPassword('Admin@123');
      setActiveRole('admin');
      performLogin('admin@railbus.com', 'Admin@123');
    } else {
      setEmail('customer@railbus.com');
      setPassword('Customer@123');
      setActiveRole('customer');
      performLogin('customer@railbus.com', 'Customer@123');
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] bg-[#FBF0E6] flex items-center justify-center px-4 py-6">
      <div className="max-w-md w-full bg-[#F7E1C9] border border-[#E8D5C2] rounded-3xl p-6 sm:p-7 shadow-card space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Brand & Heading */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#407778] text-[#FBF0E6] flex items-center justify-center mx-auto shadow-sm">
            <Ticket className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#407778]">
            Sign In to RailBus
          </h1>
          <p className="text-xs text-[#526D6E]">
            Please sign in to access railway & bus booking, live seat selection, and e-tickets.
          </p>
        </div>

        {/* Temporary Login Credentials Banner */}
        <div className="bg-[#FBF0E6] border border-[#D9C5B2] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-[#407778] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#65AFB0]" />
              Temporary Demo Credentials:
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
              One-Click Ready
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Customer Demo Pill */}
            <div
              className={`p-2.5 rounded-xl border transition-all ${
                activeRole === 'customer'
                  ? 'bg-[#407778] text-white border-[#407778] shadow-sm'
                  : 'bg-white/80 text-[#1D3536] border-[#D9C5B2] hover:bg-white'
              }`}
            >
              <button
                type="button"
                onClick={() => selectRoleCredentials('customer')}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> Customer
                  </span>
                  {activeRole === 'customer' && <Check className="w-3.5 h-3.5" />}
                </div>
                <div className="text-[10px] mt-1 opacity-90 truncate">customer@railbus.com</div>
                <div className="text-[10px] opacity-80">Pass: Customer@123</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('customer')}
                disabled={loading}
                className={`mt-2 w-full py-1 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                  activeRole === 'customer'
                    ? 'bg-white text-[#407778] hover:bg-[#FBF0E6]'
                    : 'bg-[#407778] text-white hover:bg-[#346263]'
                }`}
              >
                ⚡ 1-Click Login
              </button>
            </div>

            {/* Admin Demo Pill */}
            <div
              className={`p-2.5 rounded-xl border transition-all ${
                activeRole === 'admin'
                  ? 'bg-[#407778] text-white border-[#407778] shadow-sm'
                  : 'bg-white/80 text-[#1D3536] border-[#D9C5B2] hover:bg-white'
              }`}
            >
              <button
                type="button"
                onClick={() => selectRoleCredentials('admin')}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Admin
                  </span>
                  {activeRole === 'admin' && <Check className="w-3.5 h-3.5" />}
                </div>
                <div className="text-[10px] mt-1 opacity-90 truncate">admin@railbus.com</div>
                <div className="text-[10px] opacity-80">Pass: Admin@123</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                disabled={loading}
                className={`mt-2 w-full py-1 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                  activeRole === 'admin'
                    ? 'bg-white text-[#407778] hover:bg-[#FBF0E6]'
                    : 'bg-[#407778] text-white hover:bg-[#346263]'
                }`}
              >
                ⚡ 1-Click Login
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#407778] uppercase mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#65AFB0]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#FBF0E6] border border-[#D9C5B2] text-xs font-semibold text-[#1D3536] focus:outline-none focus:ring-2 focus:ring-[#407778]/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#407778] uppercase mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#65AFB0]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#FBF0E6] border border-[#D9C5B2] text-xs font-semibold text-[#1D3536] focus:outline-none focus:ring-2 focus:ring-[#407778]/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#407778] hover:bg-[#346263] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Signing in...' : 'Sign In to Account'}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-[#526D6E]">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-[#407778] hover:underline">
            Register here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
