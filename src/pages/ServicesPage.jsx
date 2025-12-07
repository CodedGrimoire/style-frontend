import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getServices } from '../services/api';
import Loading from '../components/Loading';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');

  const categories = ['interior', 'exterior', 'event', 'commercial', 'residential', 'other'];
  const priceRanges = [
    { label: 'Budget', min: 0, max: 100 },
    { label: 'Standard', min: 100, max: 500 },
    { label: 'Premium', min: 500, max: Infinity },
  ];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await getServices(selectedCategory || null);
        setServices(response.data || []);
        setFilteredServices(response.data || []);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [selectedCategory]);

  useEffect(() => {
    let filtered = [...services];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price range filter
    if (priceRange) {
      const range = priceRanges.find(r => r.label === priceRange);
      if (range) {
        filtered = filtered.filter(service => 
          service.cost >= range.min && service.cost < range.max
        );
      }
    }

    setFilteredServices(filtered);
  }, [searchTerm, priceRange, services]);

  if (loading) return <Loading />;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Our Services</h1>

      {/* Search and Filters */}
      <div style={{ 
        marginBottom: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <input
          type="text"
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '0.5rem', width: '100%', maxWidth: '400px' }}
        />

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: '0.5rem' }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            style={{ padding: '0.5rem' }}
          >
            <option value="">All Price Ranges</option>
            {priceRanges.map(range => (
              <option key={range.label} value={range.label}>{range.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Services Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '2rem'
      }}>
        {filteredServices.map((service) => (
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
            <p><strong>${service.cost} {service.unit}</strong></p>
            <p>Category: {service.category}</p>
            <Link to={`/service/${service._id}`}>
              <button>View Details</button>
            </Link>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <p>No services found matching your criteria.</p>
      )}
    </div>
  );
};

export default ServicesPage;

