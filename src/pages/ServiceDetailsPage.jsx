import { useEffect, useState } from 'react';
import 'animate.css';
import { useParams, useNavigate } from 'react-router-dom';
import BookingModal from '../components/BookingModal';
import { getServiceById, getServices } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import { Link } from 'react-router-dom';
import '../styles/pages.css';
import Error from '../components/Error';

const ServiceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);
  const { user, userProfile } = useAuth();
  const [service, setService] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedServices, setRelatedServices] = useState([]);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await getServiceById(id);
        setService(response.data);
        
        // Fetch related services
        try {
          const servicesResponse = await getServices(response.data?.category || null);
          const related = (servicesResponse.data || [])
            .filter(s => s._id !== id)
            .slice(0, 4);
          setRelatedServices(related);
        } catch (err) {
          console.error('Error fetching related services:', err);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setTimeout(() => setAnimate(true), 100);
      }
    };
    fetchService();
  }, [id]);

  const handleBookNow = () => {
    if (!user) {
      navigate('/login', { state: { from: `/service/${id}` } });
      return;
    }
    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => {
    const dashboardRoute = userProfile?.role === 'admin' ? '/admin' : 
                           userProfile?.role === 'decorator' ? '/decorator' : '/dashboard';
    navigate(dashboardRoute);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!service) return <Error message="Service not found" />;

  // Mock reviews data (in production, this would come from API)
  const reviews = [
    { id: 1, name: 'Sarah Johnson', rating: 5, comment: 'Excellent service! The decorator was professional and delivered exactly what we wanted.', date: '2024-01-15' },
    { id: 2, name: 'Michael Chen', rating: 5, comment: 'Great experience. Highly recommend this service to anyone looking for quality decoration.', date: '2024-01-10' },
    { id: 3, name: 'Emily Davis', rating: 4, comment: 'Very satisfied with the results. The team was responsive and completed the project on time.', date: '2024-01-05' }
  ];

  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="page-container">
      <section className="section">
        <div className="container">
          <div className={`service-details ${animate ? 'animate__animated animate__fadeInUp' : ''}`}>
            {/* Main Image Gallery */}
            {service.image && (
              <div className="service-details-image">
                <img src={service.image} alt={service.service_name} />
              </div>
            )}

            <div className="service-details-content">
              <h1 className="service-details-title">{service.service_name}</h1>
              
              <div className="service-details-meta">
                <span className="service-details-category">{service.category}</span>
                <div className="service-details-price">
                  ${service.cost} <span>{service.unit}</span>
                </div>
              </div>

              {/* Rating Section */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                marginBottom: '1.5rem',
                paddingBottom: '1.5rem',
                borderBottom: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{'★'.repeat(Math.floor(averageRating))}</span>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>
                    {averageRating.toFixed(1)} ({reviews.length} reviews)
                  </span>
                </div>
              </div>

              {/* Description Section */}
              <div className="service-details-description">
                <h3>Description</h3>
                <p>{service.description}</p>
              </div>

              {/* Key Information / Specifications */}
              <div style={{ 
                marginTop: '2rem',
                paddingTop: '2rem',
                borderTop: '2px solid var(--border-color)'
              }}>
                <h3 style={{ 
                  color: 'var(--text-primary)', 
                  marginBottom: '1.5rem',
                  fontSize: '1.5rem'
                }}>
                  Service Specifications
                </h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                  gap: '1rem' 
                }}>
                  <div className="card" style={{ padding: '1rem' }}>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Category</div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{service.category}</div>
                  </div>
                  <div className="card" style={{ padding: '1rem' }}>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Pricing</div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                      ${service.cost} {service.unit}
                    </div>
                  </div>
                  <div className="card" style={{ padding: '1rem' }}>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Availability</div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Available</div>
                  </div>
                  <div className="card" style={{ padding: '1rem' }}>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Service Type</div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Professional</div>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div style={{ 
                marginTop: '2rem',
                paddingTop: '2rem',
                borderTop: '2px solid var(--border-color)'
              }}>
                <h3 style={{ 
                  color: 'var(--text-primary)', 
                  marginBottom: '1.5rem',
                  fontSize: '1.5rem'
                }}>
                  Customer Reviews
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reviews.map((review) => (
                    <div key={review.id} className="card" style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                            {review.name}
                          </div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>
                            {new Date(review.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div style={{ fontSize: '1.25rem', color: '#ffc107' }}>
                          {'★'.repeat(review.rating)}
                        </div>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Services */}
              {relatedServices.length > 0 && (
                <div style={{ 
                  marginTop: '2rem',
                  paddingTop: '2rem',
                  borderTop: '2px solid var(--border-color)'
                }}>
                  <h3 style={{ 
                    color: 'var(--text-primary)', 
                    marginBottom: '1.5rem',
                    fontSize: '1.5rem'
                  }}>
                    Related Services
                  </h3>
                  <div className="services-grid">
                    {relatedServices.map((relatedService) => (
                      <div key={relatedService._id} className="service-card">
                        {relatedService.image && (
                          <div className="service-card-image">
                            <img src={relatedService.image} alt={relatedService.service_name} />
                          </div>
                        )}
                        <div className="service-card-content">
                          <h3 className="service-card-title">{relatedService.service_name}</h3>
                          <p className="service-card-description">
                            {relatedService.description?.substring(0, 100)}
                            {relatedService.description?.length > 100 ? '...' : ''}
                          </p>
                          <div className="service-card-meta">
                            <span className="service-card-category">{relatedService.category}</span>
                            <div className="service-card-price">
                              ${relatedService.cost} <span>{relatedService.unit}</span>
                            </div>
                          </div>
                          <Link to={`/service/${relatedService._id}`} className="btn-outline service-card-btn">
                            View Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="service-details-actions">
                {user ? (
                  <button 
                    onClick={handleBookNow} 
                    className="btn-primary service-book-btn"
                  >
                    Book Now
                  </button>
                ) : (
                  <div className="service-login-prompt">
                    <p>Please log in to book this service</p>
                    <button 
                      onClick={() => navigate('/login', { state: { from: `/service/${id}` } })}
                      className="btn-primary"
                    >
                      Login to Book
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <BookingModal
        service={service}
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
};

export default ServiceDetailsPage;
