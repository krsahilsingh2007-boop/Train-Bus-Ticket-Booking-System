import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ticket, Mail, Lock, User, Phone, UserPlus, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/register', { name, email, password, phone });
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#FBF0E6] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-[#F7E1C9] border border-[#E8D5C2] rounded-3xl p-8 shadow-card space-y-6">
        
        {/* Brand & Heading */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#407778] text-[#FBF0E6] flex items-center justify-center mx-auto shadow-sm">
            <Ticket className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#407778]">
            Create RailBus Account
          </h1>
          <p className="text-xs text-[#526D6E]">
            Join thousands of travelers enjoying atomic instant reservations.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#407778] uppercase mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#65AFB0]" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#FBF0E6] border border-[#D9C5B2] text-xs font-medium text-[#1D3536] focus:outline-none focus:ring-2 focus:ring-[#407778]/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#407778] uppercase mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#65AFB0]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#FBF0E6] border border-[#D9C5B2] text-xs font-medium text-[#1D3536] focus:outline-none focus:ring-2 focus:ring-[#407778]/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#407778] uppercase mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#65AFB0]" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#FBF0E6] border border-[#D9C5B2] text-xs font-medium text-[#1D3536] focus:outline-none focus:ring-2 focus:ring-[#407778]/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#407778] uppercase mb-1">
              Create Password (min 6 chars) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#65AFB0]" />
              <input
                type="password"
                required
                minLength="6"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#FBF0E6] border border-[#D9C5B2] text-xs font-medium text-[#1D3536] focus:outline-none focus:ring-2 focus:ring-[#407778]/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#407778] hover:bg-[#346263] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Registering Account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center text-xs text-[#526D6E]">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-[#407778] hover:underline">
            Sign In here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
