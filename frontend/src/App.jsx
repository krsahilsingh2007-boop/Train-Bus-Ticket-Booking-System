import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './layouts/Navbar';
import Footer from './layouts/Footer';
import HomePage from './pages/HomePage';
import TrainsPage from './pages/TrainsPage';
import BusesPage from './pages/BusesPage';
import MyBookingsPage from './pages/MyBookingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';

// AuthGate ensures visitors see the login page first upon entering the site
const AuthGate = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF0E6] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#407778] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-[#FBF0E6] text-[#1D3536]">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Entry Gate: First page seen is Login unless authenticated */}
              <Route
                path="/"
                element={
                  <AuthGate>
                    <HomePage />
                  </AuthGate>
                }
              />
              <Route
                path="/trains"
                element={
                  <AuthGate>
                    <TrainsPage />
                  </AuthGate>
                }
              />
              <Route
                path="/buses"
                element={
                  <AuthGate>
                    <BusesPage />
                  </AuthGate>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <AuthGate>
                    <MyBookingsPage />
                  </AuthGate>
                }
              />
              <Route
                path="/profile"
                element={
                  <AuthGate>
                    <MyBookingsPage />
                  </AuthGate>
                }
              />
              <Route
                path="/admin"
                element={
                  <AuthGate>
                    <AdminDashboard />
                  </AuthGate>
                }
              />

              {/* Public Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
