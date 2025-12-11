import { useEffect, useState } from 'react';

import '../styles/pages.css';

import ServiceCoverageMap from '../components/ServiceCoverageMap';

 import { Link } from 'react-router-dom';

import Loading from '../components/Loading';

import 'animate.css';

import { getServices, getTopDecorators } from '../services/api';

const HomePage = () => 
  
  
  {
  const [featuredServices, setFeaturedServices] = useState([]);
  
  const [animate, setAnimate] = useState(false);


 
  const [loading, setLoading] = useState(true);

   const [topDecorators, setTopDecorators] = useState([]);

  useEffect(() => 
    
    
    {
    const fetchData = async () =>
      
      
      {
      try 
      
      
      {
       
        const servicesResponse = await getServices();
        setFeaturedServices(servicesResponse.data?.slice(0, 6) || []);

       
        try 
        
        
        
        {
          const decoratorsResponse = await getTopDecorators();


       //   console.log('Decorators response:', decoratorsResponse);
          
          
          let decorators = [];


          if (Array.isArray(decoratorsResponse))
            
            
            {
            decorators = decoratorsResponse;
          } 
          
          
          else if (decoratorsResponse?.data) 
            
            
            
            {
            decorators = Array.isArray(decoratorsResponse.data) ? decoratorsResponse.data : [];
          }
          
          console.log('Extracted decorators:', decorators);
          
         
          decorators = decorators
            .filter(d => d.status === 'approved') 
            .sort((a, b) => (b.rating || 0) - (a.rating || 0)) 
            .slice(0, 3);
          
          console.log('Top 3 decorators:', decorators);
          setTopDecorators(decorators);
        }
        
        
        catch (error)
         {
          console.error('Error fetching top decorators:', error);
          
          setTopDecorators([]);
        }
      }
      
      catch (error)
      
      
      {
        console.error('Error fetching data:', error);
      } 
      
      
      finally 
      
      
      {
        setLoading(false);
        setTimeout(() => setAnimate(true), 100);
      }
    };
    fetchData();
  }, []);

  if (loading)
    
    return <Loading />;

  return (
    <div className="page-container">
     
      <section 
      
      
      className="hero-section">
        <div 
        
        
        className="container">
          <div 
          
          
          className={`hero-content ${animate ? 'animate__animated animate__fadeInUp' : ''}`}>
            <h1 
            
            
            className="hero-title">
              
              Welcome to StyleDecor
              
              
              </h1>
            <p className="hero-subtitle">


              Transform your space with our professional decoration services
            </p>
            <Link to="/services" 
            
            
            className="btn-primary hero-cta">
              Book Decoration Service
            </Link>
          </div>
        </div>
      </section>

   
      <section className="section">
        <div 
        
        
        className="container">
          <h2 
          
          
          className={`section-title ${animate ? 'animate__animated animate__fadeInUp animate__delay-1s' : ''}`}>
            Our Decoration Services
          </h2>
          <p 
          
          
          className={`section-subtitle ${animate ? 'animate__animated animate__fadeInUp animate__delay-1s' : ''}`}>
            Discover our wide range of professional decoration packages
          </p>
          <div 
          
          
          className="services-grid">
            {featuredServices.map((service, index) => (
              <div 
                key={service._id} 
                className={`service-card ${animate ? 'animate__animated animate__fadeInUp' : ''}`}


                style={animate ? { animationDelay: `${(index + 1) * 0.15}s` } : {}}
              >
                {service.image && (
                  <div className="service-card-image">
                    <img 
                      src={service.image} 


                      alt=""
                    />
                  </div>
                )}
                <div 
                
                
                className="service-card-content">


                  <h3
                  
                  
                  className="service-card-title">
                    
                    
                    {service.service_name}
                    
                    </h3>
                  <p
                  
                  
                  className="service-card-description">
                    {service.description?.substring(0, 120)}
                    {service.description?.length > 120 ? '...' : ''}
                  </p>
                  <div 
                  
                  
                  className="service-card-meta">


                    <span 
                    className="service-card-category">
                      
                      
                      
                      {service.category}
                      
                      
                      </span>

                    <div
                    
                    
                    className="service-card-price">
                      ${service.cost} <span>
                        
                        
                        {service.unit}
                        
                        
                        </span>
                    </div>
                  </div>
                  <Link to={`/service/${service._id}`} 
                  
                  
                  className="btn-outline service-card-btn">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
          {featuredServices.length > 0 && (
            <div 
            
            
            className={`text-center ${animate ? 'animate__animated animate__fadeInUp animate__delay-2s' : ''}`} style={{ marginTop: '3rem' }}>
              <Link to="/services" className="btn-primary">
                View All Services
              </Link>
            </div>
          )}
        </div>
      </section>

     
      <section 
      
      
      
      
      className="section section-alt">
        <div 
        
        
        className="container">
          <h2 
          
          
          className={`section-title ${animate ? 'animate__animated animate__fadeInUp animate__delay-3s' : ''}`}>
            Top Decorators
          </h2>
          {topDecorators.length > 0 ? (
            <div className="decorators-grid">
              {topDecorators.map((decorator, index) => (
                <div 
                  key={decorator._id || index}
               
               
                  className={`decorator-card ${animate ? 'animate__animated animate__fadeInUp' : ''}`}



                  style={animate ? { animationDelay: `${(index + 1) * 0.2}s` } : {}}
                >
                  {decorator.userId?.image && (
                    <div className="decorator-avatar">
                      <img src={decorator.userId.image} 
                      
                      
                      alt="" />
                    </div>
                  )}
                  <div 
                  
                  
                  className="decorator-info">
                    <h3 
                    
                    
                    className="decorator-name">
                      {decorator.userId?.name || decorator.userId?.email?.split('@')[0] || 'Decorator'}
                    </h3>
                    <div 
                    
                    className="decorator-rating">
                      {'★'.repeat(Math.floor(decorator.rating || 0))}
                      <span 
                      
                      
                      className="rating-value">{(decorator.rating || 0).toFixed(1)}
                      
                      
                      </span>
                    </div>
                    {decorator.specialties && decorator.specialties.length > 0 && (
                      <div 
                      
                      
                      className="decorator-specialties">
                        {decorator.specialties.map((specialty, idx) => (
                          <span key={idx} className="specialty-tag">{specialty}</span>
                        ))
                        
                        }
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div 
            
            
            className={`decorators-placeholder ${animate ? 'animate__animated animate__fadeInUp animate__delay-3s' : ''}`}>
              <p
              
              
              className="section-subtitle">
                Our top-rated decorators will be displayed here. Check back soon!
              </p>

            </div>
          )}
        </div>
      </section>

      
      <section 
      
      
      className="section">
        <div 
        
        className="container">
          <h2 
          
          
          className={`section-title ${animate ? 'animate__animated animate__fadeInUp animate__delay-4s' : ''}`}>
            Service Coverage Areas
          </h2>
          <p
          
          
          className={`section-subtitle ${animate ? 'animate__animated animate__fadeInUp animate__delay-4s' : ''}`}>
            We provide our decoration services in the following areas
          </p>
          <div className={`map-wrapper ${animate ? 'animate__animated animate__fadeInUp animate__delay-5s' : ''}`}>
            <ServiceCoverageMap />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
