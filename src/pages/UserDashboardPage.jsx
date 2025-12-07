import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyBookings, cancelBooking } from '../services/api';
import Loading from '../components/Loading';

const UserDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchBookings = async () => {
      try {
        const response = await getMyBookings();
        setBookings(response.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, navigate]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await cancelBooking(bookingId);
      setBookings(bookings.filter(b => b._id !== bookingId));
      alert('Booking cancelled successfully');
    } catch (err) {
      alert(`Error cancelling booking: ${err.message}`);
    }
  };

  const handlePayment = (booking) => {
    if (booking.paymentStatus === 'pending') {
      navigate('/payment', { state: { booking } });
    }
  };

  if (loading) return <Loading />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>My Dashboard</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>Profile Information</h2>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Name:</strong> {user?.displayName || 'Not set'}</p>
      </div>

      <div>
        <h2>Booking History</h2>
        {bookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {bookings.map((booking) => (
              <div 
                key={booking._id} 
                style={{ 
                  border: '1px solid #ccc', 
                  padding: '1rem',
                  borderRadius: '8px'
                }}
              >
                <h3>{booking.serviceId?.service_name}</h3>
                <p><strong>Date:</strong> {new Date(booking.date).toLocaleString()}</p>
                <p><strong>Location:</strong> {booking.location}</p>
                <p><strong>Status:</strong> {booking.status}</p>
                <p><strong>Payment Status:</strong> {booking.paymentStatus}</p>
                <p><strong>Amount:</strong> ${booking.serviceId?.cost} {booking.serviceId?.unit}</p>
                
                {booking.decoratorId && (
                  <p><strong>Decorator:</strong> Assigned</p>
                )}

                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                  {booking.paymentStatus === 'pending' && (
                    <button onClick={() => handlePayment(booking)}>
                      Complete Payment
                    </button>
                  )}
                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                    <button 
                      onClick={() => handleCancel(booking._id)}
                      style={{ background: '#ff6b6b', color: 'white' }}
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboardPage;

