import { useEffect, useState } from 'react';
import '../styles/pages.css';

import { getServices } from '../services/api';


import { Link } from 'react-router-dom';

import Loading from '../components/Loading';


import 'animate.css';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
 
  const [selectedCategory, setSelectedCategory] = useState('');


   const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
 
 
  const [animate, setAnimate] = useState(false);


   const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
 const [searchTerm, setSearchTerm] = useState('');
  const categories = ['interior', 'exterior', 'event', 'commercial', 'residential', 'other'];

  useEffect(() => {
    const fetchServices = async () => 
      
      
      {
      try 
      
      
      {
        const response = await getServices(selectedCategory || null);
        setServices(response.data || []);
        setFilteredServices(response.data || []);
      }
      
      
      catch (error) 
      
      
      {
        console.error('Error fetching services:', error);
      }
      
      finally 
      
      
      {
        setLoading(false);
        setTimeout(() => setAnimate(true), 100);
      }
    };
    fetchServices();
  }, [selectedCategory]);

  useEffect(() => 
    {
    let filtered = [...services];

   
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.service_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

   
    if (minPrice)
      
      
      {
      const min = parseFloat(minPrice);
      filtered = filtered.filter(service => service.cost >= min);
    }

    if (maxPrice)
      
      {
      const max = parseFloat(maxPrice);
      filtered = filtered.filter(service => service.cost <= max);
    }

    setFilteredServices(filtered);
  }, [searchTerm, minPrice, maxPrice, services]);

  if (loading) 
    
    return <Loading />;

  return (
    <div
    
    className="page-container">
      <section
      
      className="section">
        <div
        
        className="container">
          <h1 
          
          
          className={`section-title ${animate ? 'animate__animated animate__fadeInUp' : ''}`}>
            Our Services
          </h1>

          
          <div 
          
          className={`services-filters ${animate ? 'animate__animated animate__fadeInUp animate__delay-1s' : ''}`}>
            <div 
            
            
            className="filter-group">
              <label
              
              className="filter-label">
                
                Search by Service Name
                
                </label>
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="filter-row">
              <div className="filter-group">

                <label className="filter-label">
                  
                  Service Type
                  
                  </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="form-select"
                >
                  <option value="">
                    
                    
                    All Categories
                    
                    </option>
                  {categories.map(cat => (
                    <option key={cat} 
                    
                    value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))
                  
                  }
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">
                  
                  
                  Min Price ($
                  
                  
                  )</label>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="form-input"
                  min="0"
                />
              </div>

              <div className="filter-group">
                <label 
                
                
                className="filter-label">
                  
                  
                  Max Price ($)
                  
                  </label>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="form-input"
                  min="0"
                />
              </div>
            </div>
          </div>

          
          <div className="services-grid">
            {filteredServices.map((service, index) => (
              <div 
                key={service._id} 
                className={`service-card ${animate ? 'animate__animated animate__fadeInUp' : ''}`}
                style={animate ? { animationDelay: `${(index + 1) * 0.1}s` } : {}}
              >
                {service.image && (
                  <div className="service-card-image">
                    <img 
                      src={service.image} 
                      alt=""
                    />
                  </div>
                )}
                <div className="service-card-content">
                  <h3 className="service-card-title">
                    
                    
                    {service.service_name}
                    
                    </h3>
                  <p className="service-card-description">


                    {service.description?.substring(0, 100)}
                    {service.description?.length > 100 ? '...' : ''}
                  </p>
                  <div className="service-card-meta">


                    <span className="service-card-category">
                      
                      {service.category}
                      
                      
                      </span>
                    <div className="service-card-price">
                      ${service.cost} 
                      
                      
                      <span>{service.unit}</span>


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

          {filteredServices.length === 0 && (
            <div className="text-center" 
            
            
            style={
              
              { marginTop: '3rem',
              
              padding: '2rem' }}>


              <p style={
                
                
                { fontSize: '1.1rem',
                
                
                color: 'var(--gray)' 
                
                
                }}>
                No services found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
