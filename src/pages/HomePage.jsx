import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getServices } from '../services/api';
import Loading from '../components/Loading';

const HomePage = () => {
  const [featuredServices, setFeaturedServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await getServices();
        setFeaturedServices(response.data?.slice(0, 3) || []);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      {/* Hero Section */}
      <section style={{ 
        padding: '4rem 2rem', 
        textAlign: 'center',
        background: '#f5f5f5'
      }}>
        <h1>Welcome to StyleDecor</h1>
        <p>Transform your space with our professional decoration services</p>
        <Link to="/services">
          <button>Book Your Decoration Service Today</button>
        </Link>
      </section>

      {/* Services Section */}
      <section style={{ padding: '4rem 2rem' }}>
        <h2>Featured Services</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginTop: '2rem'
        }}>
          {featuredServices.map((service) => (
            <div key={service._id} style={{ 
              border: '1px solid #ccc', 
              padding: '1rem',
              borderRadius: '8px'
            }}>
              {service.image && (
                <img 
                  src={service.image} 
                  alt={service.service_name}
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                />
              )}
              <h3>{service.service_name}</h3>
              <p>{service.description}</p>
              <p>${service.cost} {service.unit}</p>
              <Link to={`/service/${service._id}`}>
                <button>View Details</button>
              </Link>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/services">
            <button>View All Services</button>
          </Link>
        </div>
      </section>

      {/* Top Decorators Section */}
      <section style={{ padding: '4rem 2rem', background: '#f5f5f5' }}>
        <h2>Top Decorators</h2>
        <p>Coming soon - Featured decorators will be displayed here</p>
      </section>
    </div>
  );
};

export default HomePage;

