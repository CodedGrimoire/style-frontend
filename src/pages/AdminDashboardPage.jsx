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
  getAllDecorators,
  getAllUsers,
  makeUserDecorator,
  approveDecorator,
  disableDecorator,
} from '../services/api';
import Loading from '../components/Loading';
import '../styles/dashboard.css';
import 'animate.css';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [decorators, setDecorators] = useState([]);
  const [users, setUsers] = useState([]);
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
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedDecoratorId, setSelectedDecoratorId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [decoratorSpecialties, setDecoratorSpecialties] = useState([]);

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
      } else if (activeTab === 'decorators') {
        try {
          const [decoratorsRes, usersRes] = await Promise.all([
            getAllDecorators(),
            getAllUsers(),
          ]);
          setDecorators(decoratorsRes.data || []);
          setUsers(usersRes.data || []);
        } catch (err) {
          console.error('Error loading decorators/users:', err);
          // If endpoints don't exist, set empty arrays
          setDecorators([]);
          setUsers([]);
        }
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
        createdByEmail: user?.email || '',
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

  const handleAssignDecorator = async (bookingId) => {
    if (!selectedDecoratorId) {
      alert('Please select a decorator');
      return;
    }
    try {
      await assignDecorator(bookingId, selectedDecoratorId);
      setSelectedBooking(null);
      setSelectedDecoratorId('');
      loadData();
      alert('Decorator assigned successfully');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleMakeDecorator = async () => {
    if (!selectedUserId) {
      alert('Please select a user');
      return;
    }
    if (decoratorSpecialties.length === 0) {
      alert('Please add at least one specialty');
      return;
    }
    try {
      await makeUserDecorator(selectedUserId, decoratorSpecialties);
      setSelectedUserId('');
      setDecoratorSpecialties([]);
      loadData();
      alert('User converted to decorator successfully');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleApproveDecorator = async (decoratorId) => {
    try {
      await approveDecorator(decoratorId);
      loadData();
      alert('Decorator approved successfully');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDisableDecorator = async (decoratorId) => {
    if (!window.confirm('Are you sure you want to disable this decorator?')) {
      return;
    }
    try {
      await disableDecorator(decoratorId);
      loadData();
      alert('Decorator disabled successfully');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const getServiceDemandChart = () => {
    if (!analytics?.demand?.serviceDemand) return null;
    
    const maxBookings = Math.max(
      ...analytics.demand.serviceDemand.map(s => s.bookingCount || 0),
      1
    );

    return (
      <div className="chart-container">
        <h3 className="chart-title">Service Demand (Number of Bookings)</h3>
        <div className="histogram">
          {analytics.demand.serviceDemand.map((service, index) => {
            const height = ((service.bookingCount || 0) / maxBookings) * 100;
            return (
              <div key={service._id || index} className="histogram-bar-container">
                <div
                  className="histogram-bar"
                  style={{ height: `${height}%` }}
                  title={`${service.serviceName}: ${service.bookingCount} bookings`}
                >
                  <span className="histogram-value">{service.bookingCount || 0}</span>
                </div>
                <div className="histogram-label">
                  {service.serviceName?.substring(0, 15)}
                  {service.serviceName?.length > 15 ? '...' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading && activeTab === 'bookings') return <Loading />;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <p className="dashboard-subtitle">Manage services, decorators, bookings, and analytics</p>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`dashboard-tab ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          Manage Bookings
        </button>
        <button
          className={`dashboard-tab ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          Manage Services
        </button>
        <button
          className={`dashboard-tab ${activeTab === 'decorators' ? 'active' : ''}`}
          onClick={() => setActiveTab('decorators')}
        >
          Manage Decorators
        </button>
        <button
          className={`dashboard-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      <div className="dashboard-content">
        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="dashboard-section animate__animated animate__fadeInUp">
            <h2 className="section-heading">All Bookings</h2>
            {bookings.length === 0 ? (
              <div className="empty-state">
                <p>No bookings found.</p>
              </div>
            ) : (
              <div className="bookings-grid">
                {bookings.map((booking) => (
                  <div key={booking._id} className="booking-card">
                    <div className="booking-header">
                      <h3 className="booking-service-name">
                        {booking.serviceId?.service_name || 'Unknown Service'}
                      </h3>
                      <span className={`status-badge status-${booking.status}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="booking-details">
                      <div className="booking-detail-item">
                        <span className="detail-label">User:</span>
                        <span className="detail-value">
                          {booking.userId?.email || booking.userId || 'Unknown'}
                        </span>
                      </div>
                      <div className="booking-detail-item">
                        <span className="detail-label">Date:</span>
                        <span className="detail-value">
                          {new Date(booking.date).toLocaleString()}
                        </span>
                      </div>
                      <div className="booking-detail-item">
                        <span className="detail-label">Location:</span>
                        <span className="detail-value">{booking.location}</span>
                      </div>
                      <div className="booking-detail-item">
                        <span className="detail-label">Payment:</span>
                        <span className={`payment-badge payment-${booking.paymentStatus}`}>
                          {booking.paymentStatus}
                        </span>
                      </div>
                      <div className="booking-detail-item">
                        <span className="detail-label">Amount:</span>
                        <span className="detail-value">
                          ${booking.serviceId?.cost} {booking.serviceId?.unit}
                        </span>
                      </div>
                      {booking.decoratorId && (
                        <div className="booking-detail-item">
                          <span className="detail-label">Decorator:</span>
                          <span className="detail-value">Assigned</span>
                        </div>
                      )}
                    </div>
                    <div className="booking-actions">
                      {!booking.decoratorId && booking.paymentStatus === 'paid' && (
                        <button
                          className="btn-primary"
                          onClick={() => setSelectedBooking(booking._id)}
                        >
                          Assign Decorator
                        </button>
                      )}
                      {selectedBooking === booking._id && (
                        <div className="assign-decorator-form">
                          <select
                            value={selectedDecoratorId}
                            onChange={(e) => setSelectedDecoratorId(e.target.value)}
                            className="form-select"
                          >
                            <option value="">Select Decorator</option>
                            {decorators
                              .filter(d => d.status === 'approved')
                              .map(decorator => (
                                <option key={decorator._id} value={decorator._id}>
                                  {decorator.userId?.name || decorator.userId?.email || decorator._id}
                                </option>
                              ))}
                          </select>
                          <button
                            className="btn-primary"
                            onClick={() => handleAssignDecorator(booking._id)}
                          >
                            Confirm
                          </button>
                          <button
                            className="btn-outline"
                            onClick={() => {
                              setSelectedBooking(null);
                              setSelectedDecoratorId('');
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="dashboard-section animate__animated animate__fadeInUp">
            <h2 className="section-heading">Manage Services & Packages</h2>
            
            <form 
              onSubmit={editingService ? handleUpdateService : handleCreateService}
              className="service-form"
            >
              <h3 className="form-title">
                {editingService ? 'Edit Service' : 'Create New Service'}
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Service Name *</label>
                  <input
                    type="text"
                    value={serviceForm.service_name}
                    onChange={(e) => setServiceForm({ ...serviceForm, service_name: e.target.value })}
                    required
                    className="form-input"
                    placeholder="e.g., Interior Design Consultation"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Cost (BDT) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={serviceForm.cost}
                    onChange={(e) => setServiceForm({ ...serviceForm, cost: e.target.value })}
                    required
                    className="form-input"
                    placeholder="150"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit *</label>
                  <select
                    value={serviceForm.unit}
                    onChange={(e) => setServiceForm({ ...serviceForm, unit: e.target.value })}
                    className="form-select"
                  >
                    <option value="per hour">Per Hour</option>
                    <option value="per room">Per Room</option>
                    <option value="per project">Per Project</option>
                    <option value="per square foot">Per Square Foot</option>
                    <option value="per floor">Per Floor</option>
                    <option value="per meter">Per Meter</option>
                    <option value="flat rate">Flat Rate</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                    className="form-select"
                  >
                    <option value="interior">Interior</option>
                    <option value="exterior">Exterior</option>
                    <option value="event">Event</option>
                    <option value="commercial">Commercial</option>
                    <option value="residential">Residential</option>
                    <option value="home">Home</option>
                    <option value="wedding">Wedding</option>
                    <option value="office">Office</option>
                    <option value="seminar">Seminar</option>
                    <option value="meeting">Meeting</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group form-group-full">
                  <label className="form-label">Description *</label>
                  <textarea
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    required
                    rows="4"
                    className="form-textarea"
                    placeholder="Detailed description of the service..."
                  />
                </div>
                <div className="form-group form-group-full">
                  <label className="form-label">Image URL</label>
                  <input
                    type="url"
                    value={serviceForm.image}
                    onChange={(e) => setServiceForm({ ...serviceForm, image: e.target.value })}
                    className="form-input"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
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
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <h3 className="section-subheading">Existing Services</h3>
            {services.length === 0 ? (
              <div className="empty-state">
                <p>No services found.</p>
              </div>
            ) : (
              <div className="services-grid">
                {services.map((service) => (
                  <div key={service._id} className="service-card">
                    {service.image && (
                      <div className="service-card-image">
                        <img src={service.image} alt={service.service_name} />
                      </div>
                    )}
                    <div className="service-card-content">
                      <h4 className="service-card-title">{service.service_name}</h4>
                      <p className="service-card-meta">
                        ${service.cost} {service.unit} - {service.category}
                      </p>
                      <p className="service-card-description">{service.description}</p>
                      <div className="service-card-actions">
                        <button
                          className="btn-outline"
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
                          className="btn-outline btn-danger"
                          onClick={() => handleDeleteService(service._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Decorators Tab */}
        {activeTab === 'decorators' && (
          <div className="dashboard-section animate__animated animate__fadeInUp">
            <h2 className="section-heading">Manage Decorators</h2>
            
            {/* Make User a Decorator */}
            <div className="decorator-form-section">
              <h3 className="section-subheading">Make User a Decorator</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Select User</label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Select a user</option>
                    {users
                      .filter(u => u.role !== 'decorator' && u.role !== 'admin')
                      .map(user => (
                        <option key={user._id} value={user._id}>
                          {user.name || user.email} ({user.email})
                        </option>
                      ))}
                  </select>
                </div>
                <div className="form-group form-group-full">
                  <label className="form-label">Specialties (comma-separated)</label>
                  <input
                    type="text"
                    value={decoratorSpecialties.join(', ')}
                    onChange={(e) => {
                      const specialties = e.target.value
                        .split(',')
                        .map(s => s.trim())
                        .filter(s => s.length > 0);
                      setDecoratorSpecialties(specialties);
                    }}
                    className="form-input"
                    placeholder="e.g., interior, residential, wedding"
                  />
                </div>
                <div className="form-group">
                  <button
                    className="btn-primary"
                    onClick={handleMakeDecorator}
                    disabled={!selectedUserId || decoratorSpecialties.length === 0}
                  >
                    Make Decorator
                  </button>
                </div>
              </div>
            </div>

            {/* Decorators List */}
            <h3 className="section-subheading">All Decorators</h3>
            {loading ? (
              <Loading />
            ) : decorators.length === 0 ? (
              <div className="empty-state">
                <p>No decorators found.</p>
              </div>
            ) : (
              <div className="decorators-grid">
                {decorators.map((decorator) => (
                  <div key={decorator._id} className="decorator-card">
                    <div className="decorator-header">
                      <h4 className="decorator-name">
                        {decorator.userId?.name || decorator.userId?.email || 'Unknown'}
                      </h4>
                      <span className={`status-badge status-${decorator.status}`}>
                        {decorator.status}
                      </span>
                    </div>
                    <div className="decorator-details">
                      <div className="decorator-detail-item">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">
                          {decorator.userId?.email || 'N/A'}
                        </span>
                      </div>
                      <div className="decorator-detail-item">
                        <span className="detail-label">Specialties:</span>
                        <span className="detail-value">
                          {decorator.specialties?.join(', ') || 'None'}
                        </span>
                      </div>
                      <div className="decorator-detail-item">
                        <span className="detail-label">Rating:</span>
                        <span className="detail-value">
                          {decorator.rating || 0} / 5
                        </span>
                      </div>
                      <div className="decorator-detail-item">
                        <span className="detail-label">Projects:</span>
                        <span className="detail-value">
                          {decorator.completedProjects || 0} completed
                        </span>
                      </div>
                    </div>
                    <div className="decorator-actions">
                      {decorator.status === 'pending' && (
                        <button
                          className="btn-primary"
                          onClick={() => handleApproveDecorator(decorator._id)}
                        >
                          Approve
                        </button>
                      )}
                      {decorator.status === 'approved' && (
                        <button
                          className="btn-outline btn-danger"
                          onClick={() => handleDisableDecorator(decorator._id)}
                        >
                          Disable
                        </button>
                      )}
                      {decorator.status === 'disabled' && (
                        <button
                          className="btn-primary"
                          onClick={() => handleApproveDecorator(decorator._id)}
                        >
                          Re-enable
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="dashboard-section animate__animated animate__fadeInUp">
            <h2 className="section-heading">Analytics & Reports</h2>
            {loading ? (
              <Loading />
            ) : analytics ? (
              <div className="analytics-container">
                {/* Revenue Analytics */}
                <div className="analytics-card">
                  <h3 className="analytics-title">Revenue Monitoring</h3>
                  <div className="analytics-stats">
                    <div className="analytics-stat">
                      <span className="stat-label">Total Revenue</span>
                      <span className="stat-value-large">
                        ${parseFloat(analytics.revenue?.totalRevenue || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="analytics-stat">
                      <span className="stat-label">Total Transactions</span>
                      <span className="stat-value-large">
                        {analytics.revenue?.totalTransactions || 0}
                      </span>
                    </div>
                  </div>
                  {analytics.revenue?.revenueByMonth && (
                    <div className="revenue-by-month">
                      <h4>Revenue by Month</h4>
                      <div className="revenue-list">
                        {Object.entries(analytics.revenue.revenueByMonth).map(([month, revenue]) => (
                          <div key={month} className="revenue-item">
                            <span>{month}</span>
                            <span>${parseFloat(revenue).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Service Demand Chart */}
                <div className="analytics-card">
                  <h3 className="analytics-title">Service Demand Chart</h3>
                  {getServiceDemandChart()}
                </div>

                {/* Service Demand Details */}
                {analytics.demand?.serviceDemand && (
                  <div className="analytics-card">
                    <h3 className="analytics-title">Service Demand Details</h3>
                    <div className="demand-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Service Name</th>
                            <th>Category</th>
                            <th>Total Bookings</th>
                            <th>Completed</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.demand.serviceDemand.map((service) => (
                            <tr key={service._id}>
                              <td>{service.serviceName}</td>
                              <td>{service.serviceCategory}</td>
                              <td>{service.bookingCount || 0}</td>
                              <td>{service.completedCount || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <p>No analytics data available.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
