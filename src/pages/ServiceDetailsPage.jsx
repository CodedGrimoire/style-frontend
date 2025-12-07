import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getServiceById } from '../services/api';
import Loading from '../components/Loading';
import Error from '../components/Error';

const ServiceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await getServiceById(id);
        setService(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  const handleBooking = () => {
    if (!bookingDate || !location) {
      alert('Please fill in all fields');
      return;
    }
    // Navigate to booking page with service data
    navigate('/booking', {
      state: {
        service,
        bookingDate,
        location,
      },
    });
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!service) return <Error message="Service not found" />;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      {service.image && (
        <img 
          src={service.image} 
          alt={service.service_name}
          style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', marginBottom: '2rem' }}
        />
      )}
      <h1>{service.service_name}</h1>
      <p><strong>Category:</strong> {service.category}</p>
      <p><strong>Price:</strong> ${service.cost} {service.unit}</p>
      <p><strong>Description:</strong></p>
      <p>{service.description}</p>

      <div style={{ marginTop: '3rem', borderTop: '1px solid #ccc', paddingTop: '2rem' }}>
        <h2>Book This Service</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <label>Booking Date & Time:</label>
            <input
              type="datetime-local"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
              required
            />
          </div>
          <div>
            <label>Location:</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter your address"
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
              required
            />
          </div>
          <button onClick={handleBooking} style={{ padding: '0.75rem', marginTop: '1rem' }}>
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsPage;

