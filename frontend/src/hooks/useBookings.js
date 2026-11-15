import { useState, useEffect } from 'react';
import api from '../services/api';

export const useBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/my-bookings');
      setBookings(res.data.bookings || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load booking records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return { bookings, loading, error, refetch: fetchBookings };
};

export default useBookings;
