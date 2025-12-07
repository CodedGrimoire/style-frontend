import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createBooking } from '../services/api';
import Loading from '../components/Loading';

const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    serviceId: location.state?.service?._id || '',
    date: location.state?.bookingDate || '',
    location: location.state?.location || '',
    name: user?.displayName || '',
    email: user?.email || '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!location.state?.service) {
      navigate('/services');
      return;
    }
  }, [user, location.state, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const bookingData = {
        serviceId: formData.serviceId,
        date: new Date(formData.date).toISOString(),
        location: formData.location,
      };

      const response = await createBooking(bookingData);
      navigate('/payment', { state: { booking: response.data } });
    } catch (error) {
      alert(`Error creating booking: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  const service = location.state?.service;

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Complete Your Booking</h1>

      {service && (
        <div style={{ 
          border: '1px solid #ccc', 
          padding: '1rem', 
          marginBottom: '2rem',
          borderRadius: '8px'
        }}>
          <h3>{service.service_name}</h3>
          <p>${service.cost} {service.unit}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
          />
        </div>

        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
          />
        </div>

        <div>
          <label>Booking Date & Time:</label>
          <input
            type="datetime-local"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
          />
        </div>

        <div>
          <label>Location:</label>
          <textarea
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Enter your full address"
            required
            rows="4"
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
          />
        </div>

        <div style={{ 
          border: '1px solid #ccc', 
          padding: '1rem', 
          marginTop: '1rem',
          borderRadius: '8px'
        }}>
          <h3>Price Summary</h3>
          {service && (
            <>
              <p>Service: ${service.cost} {service.unit}</p>
              <p><strong>Total: ${service.cost}</strong></p>
            </>
          )}
        </div>

        <button 
          type="submit" 
          style={{ 
            padding: '0.75rem', 
            marginTop: '1rem',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Proceed to Payment
        </button>
      </form>
    </div>
  );
};

export default BookingPage;

