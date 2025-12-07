import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getServices } from '../services/api';
import Loading from '../components/Loading';
import '../styles/pages.css';

const HomePage = () => {
  const [featuredServices, setFeaturedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await getServices();
        setFeaturedServices(response.data?.slice(0, 3) || []);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
        // Trigger animation after content loads
        setTimeout(() => setAnimate(true), 100);
      }
    };
    fetchServices();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className={`hero-content ${animate ? 'animate__animated animate__fadeInUp' : ''}`}>
            <h1 className="hero-title">Welcome to StyleDecor</h1>
            <p className="hero-subtitle">
              Transform your space with our professional decoration services
            </p>
            <Link to="/services" className="btn-primary hero-cta">
              Book Your Decoration Service Today
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section">
        <div className="container">
          <h2 className={`section-title ${animate ? 'animate__animated animate__fadeInUp animate__delay-1s' : ''}`}>Featured Services</h2>
          <div className="services-grid">
            {featuredServices.map((service, index) => (
              <div 
                key={service._id} 
                className={`service-card ${animate ? 'animate__animated animate__fadeInUp' : ''}`}
                style={{ animationDelay: `${(index + 1) * 0.2}s` }}
              >
                {service.image && (
                  <div className="service-card-image">
                    <img 
                      src={service.image} 
                      alt={service.service_name}
                    />
                  </div>
                )}
                <div className="service-card-content">
                  <h3 className="service-card-title">{service.service_name}</h3>
                  <p className="service-card-description">{service.description}</p>
                  <div className="service-card-price">
                    ${service.cost} <span>{service.unit}</span>
                  </div>
                  <Link to={`/service/${service._id}`} className="btn-outline service-card-btn">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
          {featuredServices.length > 0 && (
            <div className={`text-center ${animate ? 'animate__animated animate__fadeInUp animate__delay-2s' : ''}`} style={{ marginTop: '3rem' }}>
              <Link to="/services" className="btn-primary">
                View All Services
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Top Decorators Section */}
      <section className="section section-alt">
        <div className="container">
          <h2 className={`section-title ${animate ? 'animate__animated animate__fadeInUp animate__delay-3s' : ''}`}>Top Decorators</h2>
          <p className={`section-subtitle ${animate ? 'animate__animated animate__fadeInUp animate__delay-3s' : ''}`}>
            Coming soon - Featured decorators will be displayed here
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
