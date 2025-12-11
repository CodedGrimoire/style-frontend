import { useEffect, useState } from 'react';

import 'animate.css';
import { useParams, useNavigate } from 'react-router-dom';

import BookingModal from '../components/BookingModal';

 import { getServiceById } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

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

  useEffect(() => {
    const fetchService = async () => 
      
      
      {
      try 
      
      {
        const response = await getServiceById(id);
        setService(response.data);
      } 
      catch (err) 
      
      
      {
        setError(err.message);
      } 
      
      
      finally 
      
      
      {
        setLoading(false);
        setTimeout(() => setAnimate(true), 100);
      }
    };
    fetchService();
  }, [id]);

  const handleBookNow = () => 
    
    
    {
    if (!user) 
      {
      navigate('/login', { state: { from: `/service/${id}` } });
      return;
    }
    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => 
    
    
    {
    
    const dashboardRoute = userProfile?.role === 'admin' ? '/admin' : 
                           userProfile?.role === 'decorator' ? '/decorator' : '/dashboard';
    navigate(dashboardRoute);
  };

  if (loading) 
    
    return <Loading />;
  if (error) 
    
    return <Error message={error} />;
  if (!service) 
    
    return <Error message="Service not found" />;

  return (
    <div 
    
    className="page-container">
      <section
      
      className="section">
        <div className="container">
          <div 
          
          className={`service-details ${animate ? 'animate__animated animate__fadeInUp' : ''}`}>
            {service.image && (
              <div 
              
              className="service-details-image">
                <img 
                  src={service.image} 
                  alt=""
                />
              </div>
            )}

            <div 
            
            
            className="service-details-content">
              <h1 
              
              
              className="service-details-title">
                
                
                {service.service_name}
                
                </h1>
              
              <div 
              
              
              className="service-details-meta">
                <span 
                
                
                className="service-details-category">
                  
                  
                  {service.category}
                  
                  
                  </span>
                <div
                
                className="service-details-price">
                  ${service.cost} <span>{service.unit}</span>
                </div>
              </div>

              <div className="service-details-description">
                <h3>
                  
                  Description
                  
                  </h3>
                <p>
                  
                  {service.description}
                  
                  </p>
              </div>

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
                    <p>
                      
                      
                      Please log in to book this service
                      
                      </p>
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
