import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getAllBookings,
  createService,
  updateService,
  deleteService,
  getServices,
  assignDecorator,
  getRevenueAnalytics,
  getServiceDemandAnalytics,
} from '../services/api';
import Loading from '../components/Loading';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serviceForm, setServiceForm] = useState({
    service_name: '',
    cost: '',
    unit: 'per hour',
    category: 'interior',
    description: '',
    image: '',
  });
  const [editingService, setEditingService] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();
  }, [user, navigate, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'bookings') {
        const response = await getAllBookings();
        setBookings(response.data || []);
      } else if (activeTab === 'services') {
        const response = await getServices();
        setServices(response.data || []);
      } else if (activeTab === 'analytics') {
        const [revenue, demand] = await Promise.all([
          getRevenueAnalytics(),
          getServiceDemandAnalytics(),
        ]);
        setAnalytics({ revenue: revenue.data, demand: demand.data });
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      await createService({
        ...serviceForm,
        cost: parseFloat(serviceForm.cost),
      });
      setServiceForm({
        service_name: '',
        cost: '',
        unit: 'per hour',
        category: 'interior',
        description: '',
        image: '',
      });
      loadData();
      alert('Service created successfully');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleUpdateService = async (e) => {
    e.preventDefault();
    try {
      await updateService(editingService._id, {
        ...serviceForm,
        cost: parseFloat(serviceForm.cost),
      });
      setEditingService(null);
      setServiceForm({
        service_name: '',
        cost: '',
        unit: 'per hour',
        category: 'interior',
        description: '',
        image: '',
      });
      loadData();
      alert('Service updated successfully');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }
    try {
      await deleteService(id);
      loadData();
      alert('Service deleted successfully');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleAssignDecorator = async (bookingId, decoratorId) => {
    try {
      await assignDecorator(bookingId, decoratorId);
      loadData();
      alert('Decorator assigned successfully');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading && activeTab === 'bookings') return <Loading />;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Admin Dashboard</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #ccc' }}>
        <button 
          onClick={() => setActiveTab('bookings')}
          style={{ 
            padding: '0.5rem 1rem',
            background: activeTab === 'bookings' ? '#007bff' : 'transparent',
            color: activeTab === 'bookings' ? 'white' : 'black',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Bookings
        </button>
        <button 
          onClick={() => setActiveTab('services')}
          style={{ 
            padding: '0.5rem 1rem',
            background: activeTab === 'services' ? '#007bff' : 'transparent',
            color: activeTab === 'services' ? 'white' : 'black',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Services
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          style={{ 
            padding: '0.5rem 1rem',
            background: activeTab === 'analytics' ? '#007bff' : 'transparent',
            color: activeTab === 'analytics' ? 'white' : 'black',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Analytics
        </button>
      </div>

      {activeTab === 'bookings' && (
        <div>
          <h2>All Bookings</h2>
          {bookings.length === 0 ? (
            <p>No bookings found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {bookings.map((booking) => (
                <div key={booking._id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
                  <p><strong>Service:</strong> {booking.serviceId?.service_name}</p>
                  <p><strong>User:</strong> {booking.userId?.email || booking.userId}</p>
                  <p><strong>Date:</strong> {new Date(booking.date).toLocaleString()}</p>
                  <p><strong>Status:</strong> {booking.status}</p>
                  <p><strong>Payment:</strong> {booking.paymentStatus}</p>
                  {!booking.decoratorId && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <input 
                        type="text" 
                        placeholder="Decorator ID" 
                        style={{ padding: '0.5rem', marginRight: '0.5rem' }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAssignDecorator(booking._id, e.target.value);
                          }
                        }}
                      />
                      <button onClick={() => {
                        const decoratorId = prompt('Enter Decorator ID:');
                        if (decoratorId) handleAssignDecorator(booking._id, decoratorId);
                      }}>
                        Assign Decorator
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'services' && (
        <div>
          <h2>Manage Services</h2>
          
          <form 
            onSubmit={editingService ? handleUpdateService : handleCreateService}
            style={{ 
              border: '1px solid #ccc', 
              padding: '1rem', 
              marginBottom: '2rem',
              borderRadius: '8px'
            }}
          >
            <h3>{editingService ? 'Edit Service' : 'Create New Service'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Service Name"
                value={serviceForm.service_name}
                onChange={(e) => setServiceForm({ ...serviceForm, service_name: e.target.value })}
                required
                style={{ padding: '0.5rem' }}
              />
              <input
                type="number"
                placeholder="Cost"
                value={serviceForm.cost}
                onChange={(e) => setServiceForm({ ...serviceForm, cost: e.target.value })}
                required
                style={{ padding: '0.5rem' }}
              />
              <select
                value={serviceForm.unit}
                onChange={(e) => setServiceForm({ ...serviceForm, unit: e.target.value })}
                style={{ padding: '0.5rem' }}
              >
                <option value="per hour">Per Hour</option>
                <option value="per room">Per Room</option>
                <option value="per project">Per Project</option>
                <option value="per square foot">Per Square Foot</option>
                <option value="flat rate">Flat Rate</option>
              </select>
              <select
                value={serviceForm.category}
                onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                style={{ padding: '0.5rem' }}
              >
                <option value="interior">Interior</option>
                <option value="exterior">Exterior</option>
                <option value="event">Event</option>
                <option value="commercial">Commercial</option>
                <option value="residential">Residential</option>
                <option value="other">Other</option>
              </select>
              <textarea
                placeholder="Description"
                value={serviceForm.description}
                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                required
                rows="4"
                style={{ padding: '0.5rem' }}
              />
              <input
                type="url"
                placeholder="Image URL"
                value={serviceForm.image}
                onChange={(e) => setServiceForm({ ...serviceForm, image: e.target.value })}
                style={{ padding: '0.5rem' }}
              />
              <button type="submit" style={{ padding: '0.75rem' }}>
                {editingService ? 'Update Service' : 'Create Service'}
              </button>
              {editingService && (
                <button 
                  type="button"
                  onClick={() => {
                    setEditingService(null);
                    setServiceForm({
                      service_name: '',
                      cost: '',
                      unit: 'per hour',
                      category: 'interior',
                      description: '',
                      image: '',
                    });
                  }}
                  style={{ padding: '0.75rem', marginTop: '0.5rem' }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <h3>Existing Services</h3>
          {services.length === 0 ? (
            <p>No services found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {services.map((service) => (
                <div key={service._id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
                  <h4>{service.service_name}</h4>
                  <p>${service.cost} {service.unit} - {service.category}</p>
                  <p>{service.description}</p>
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => {
                        setEditingService(service);
                        setServiceForm({
                          service_name: service.service_name,
                          cost: service.cost.toString(),
                          unit: service.unit,
                          category: service.category,
                          description: service.description,
                          image: service.image || '',
                        });
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteService(service._id)}
                      style={{ background: '#ff6b6b', color: 'white' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div>
          <h2>Analytics</h2>
          {loading ? (
            <Loading />
          ) : analytics ? (
            <div>
              <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>
                <h3>Revenue Analytics</h3>
                <p><strong>Total Revenue:</strong> ${analytics.revenue?.totalRevenue || 0}</p>
                <p><strong>Total Transactions:</strong> {analytics.revenue?.totalTransactions || 0}</p>
              </div>
              <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
                <h3>Service Demand</h3>
                <pre>{JSON.stringify(analytics.demand, null, 2)}</pre>
              </div>
            </div>
          ) : (
            <p>No analytics data available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;

