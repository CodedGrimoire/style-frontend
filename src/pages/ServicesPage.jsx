import { useEffect, useState, useMemo } from 'react';
import '../styles/pages.css';
import { getServices } from '../services/api';
import { Link } from 'react-router-dom';
import Loading from '../components/Loading';
import SkeletonCard from '../components/SkeletonCard';
import 'animate.css';

const ITEMS_PER_PAGE = 12;

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animate, setAnimate] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, price-asc, price-desc
  const [currentPage, setCurrentPage] = useState(1);
  const categories = ['interior', 'exterior', 'event', 'commercial', 'residential', 'other'];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await getServices(selectedCategory || null);
        setServices(response.data || []);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
        setTimeout(() => setAnimate(true), 100);
      }
    };
    fetchServices();
  }, [selectedCategory]);

  // Filter and sort services
  const processedServices = useMemo(() => {
    let filtered = [...services];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price filters
    if (minPrice) {
      const min = parseFloat(minPrice);
      filtered = filtered.filter(service => service.cost >= min);
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      filtered = filtered.filter(service => service.cost <= max);
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.service_name.localeCompare(b.service_name);
      } else if (sortBy === 'price-asc') {
        return a.cost - b.cost;
      } else if (sortBy === 'price-desc') {
        return b.cost - a.cost;
      }
      return 0;
    });

    return filtered;
  }, [services, searchTerm, minPrice, maxPrice, sortBy]);

  // Pagination
  const totalPages = Math.ceil(processedServices.length / ITEMS_PER_PAGE);
  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedServices.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [processedServices, currentPage]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, minPrice, maxPrice, selectedCategory, sortBy]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="section">
            <h1 className="section-title">Our Services</h1>
            <SkeletonCard count={8} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <section className="section">
        <div className="container">
          <h1 className={`section-title ${animate ? 'animate__animated animate__fadeInUp' : ''}`}>
            Our Services
          </h1>
          <p className={`section-subtitle ${animate ? 'animate__animated animate__fadeInUp' : ''}`}>
            Discover our wide range of professional decoration services
          </p>

          <div className={`services-filters ${animate ? 'animate__animated animate__fadeInUp animate__delay-1s' : ''}`}>
            <div className="filter-group">
              <label className="filter-label">Search Services</label>
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="filter-row">
              <div className="filter-group">
                <label className="filter-label">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="form-select"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Min Price ($)</label>
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
                <label className="filter-label">Max Price ($)</label>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="form-input"
                  min="0"
                />
              </div>

              <div className="filter-group">
                <label className="filter-label">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-select"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {processedServices.length > 0 && (
            <div style={{ 
              marginBottom: '1.5rem', 
              color: 'var(--text-secondary)',
              textAlign: 'center'
            }}>
              Showing {paginatedServices.length} of {processedServices.length} services
            </div>
          )}

          <div className="services-grid">
            {paginatedServices.map((service, index) => (
              <div 
                key={service._id} 
                className={`service-card ${animate ? 'animate__animated animate__fadeInUp' : ''}`}
                style={animate ? { animationDelay: `${(index + 1) * 0.05}s` } : {}}
              >
                {service.image && (
                  <div className="service-card-image">
                    <img src={service.image} alt={service.service_name} />
                  </div>
                )}
                <div className="service-card-content">
                  <h3 className="service-card-title">{service.service_name}</h3>
                  <p className="service-card-description">
                    {service.description?.substring(0, 100)}
                    {service.description?.length > 100 ? '...' : ''}
                  </p>
                  <div className="service-card-meta">
                    <span className="service-card-category">{service.category}</span>
                    <div className="service-card-price">
                      ${service.cost} <span>{service.unit}</span>
                    </div>
                  </div>
                  <Link to={`/service/${service._id}`} className="btn-outline service-card-btn">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {processedServices.length === 0 && (
            <div className="text-center" style={{ marginTop: '3rem', padding: '2rem' }}>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-tertiary)' }}>
                No services found matching your criteria.
              </p>
              <button 
                className="btn-outline" 
                onClick={() => {
                  setSearchTerm('');
                  setMinPrice('');
                  setMaxPrice('');
                  setSelectedCategory('');
                  setSortBy('name');
                }}
                style={{ marginTop: '1rem' }}
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination" style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              gap: '1rem',
              marginTop: '3rem',
              flexWrap: 'wrap'
            }}>
              <button
                className="btn-outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span style={{ color: 'var(--text-secondary)' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="btn-outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
