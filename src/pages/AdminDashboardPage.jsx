import { useEffect, useState, useMemo } from 'react';
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
  getMyBookings,
  cancelBooking,
} from '../services/api';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';
import '../styles/dashboard.css';
import 'animate.css';

const ITEMS_PER_PAGE = 5;

const AdminDashboardPage = () => {
  const { user, userProfile } = useAuth();
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
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date' or 'status'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');
  const [decoratorSearchTerm, setDecoratorSearchTerm] = useState('');
  // User dashboard state
  const [myBookings, setMyBookings] = useState([]);
  const [myBookingsSearchTerm, setMyBookingsSearchTerm] = useState('');
  const [myBookingsSortBy, setMyBookingsSortBy] = useState('date');
  const [myBookingsSortOrder, setMyBookingsSortOrder] = useState('desc');
  const [myBookingsCurrentPage, setMyBookingsCurrentPage] = useState(1);
  const [profileData, setProfileData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Reset all state when user changes to prevent showing previous user's data
    setBookings([]);
    setServices([]);
    setDecorators([]);
    setUsers([]);
    setAnalytics(null);
    setSearchTerm('');
    setServiceSearchTerm('');
    setDecoratorSearchTerm('');
    setSortBy('date');
    setSortOrder('desc');
    setCurrentPage(1);
    setSelectedBooking(null);
    setSelectedDecoratorId('');
    setSelectedUserId('');
    setDecoratorSpecialties([]);
    setEditingService(null);
    setServiceForm({
      service_name: '',
      cost: '',
      unit: 'per hour',
      category: 'interior',
      description: '',
      image: '',
    });
    // Reset user dashboard state
    setMyBookings([]);
    setMyBookingsSearchTerm('');
    setMyBookingsSortBy('date');
    setMyBookingsSortOrder('desc');
    setMyBookingsCurrentPage(1);
    setProfileData({
      name: user?.displayName || '',
      email: user?.email || '',
    });

    loadData();
  }, [user, navigate, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'bookings') {
        // Load both bookings and decorators (needed for assignment)
        try {
          const [bookingsRes, decoratorsRes] = await Promise.all([
            getAllBookings(),
            getAllDecorators(),
          ]);
          setBookings(bookingsRes.data || []);
          
          // Parse decorators response
          let decoratorsData = [];
          if (Array.isArray(decoratorsRes)) {
            decoratorsData = decoratorsRes;
          } else if (decoratorsRes?.data) {
            decoratorsData = Array.isArray(decoratorsRes.data) ? decoratorsRes.data : [];
          } else if (decoratorsRes?.success && decoratorsRes?.data) {
            decoratorsData = Array.isArray(decoratorsRes.data) ? decoratorsRes.data : [];
          }
          
          console.log('Decorators loaded for bookings tab:', decoratorsData);
          setDecorators(decoratorsData);
          
          toast.success(`Bookings loaded successfully. ${decoratorsData.length} decorators available.`);
        } catch (err) {
          console.error('Error loading bookings/decorators:', err);
          // Still try to load bookings even if decorators fail
          try {
            const bookingsRes = await getAllBookings();
            setBookings(bookingsRes.data || []);
            toast.success('Bookings loaded successfully');
          } catch (bookingErr) {
            toast.error(bookingErr.message || 'Failed to load bookings');
          }
          setDecorators([]);
          toast.error('Failed to load decorators: ' + (err.message || 'Unknown error'));
        }
      } else if (activeTab === 'services') {
        const response = await getServices();
        setServices(response.data || []);
        toast.success('Services loaded successfully');
      } else if (activeTab === 'decorators') {
        try {
          const [decoratorsRes, usersRes] = await Promise.all([
            getAllDecorators(),
            getAllUsers(),
          ]);
          console.log('Decorators response:', decoratorsRes);
          console.log('Users response:', usersRes);
          
          // Handle different response formats
          let decoratorsData = [];
          if (Array.isArray(decoratorsRes)) {
            decoratorsData = decoratorsRes;
          } else if (decoratorsRes?.data) {
            decoratorsData = Array.isArray(decoratorsRes.data) ? decoratorsRes.data : [];
          } else if (decoratorsRes?.success && decoratorsRes?.data) {
            decoratorsData = Array.isArray(decoratorsRes.data) ? decoratorsRes.data : [];
          }
          
          let usersData = [];
          if (Array.isArray(usersRes)) {
            usersData = usersRes;
          } else if (usersRes?.data) {
            usersData = Array.isArray(usersRes.data) ? usersRes.data : [];
          } else if (usersRes?.success && usersRes?.data) {
            usersData = Array.isArray(usersRes.data) ? usersRes.data : [];
          }
          
          console.log('Parsed decorators:', decoratorsData);
          console.log('Parsed users:', usersData);
          
          setDecorators(decoratorsData);
          setUsers(usersData);
          if (decoratorsData.length > 0 || usersData.length > 0) {
            toast.success(`Loaded ${decoratorsData.length} decorators and ${usersData.length} users`);
          } else {
            toast.info('No decorators or users found');
          }
        } catch (err) {
          console.error('Error loading decorators/users:', err);
          setDecorators([]);
          setUsers([]);
          toast.error(err.message || 'Failed to load decorators/users');
        }
      } else if (activeTab === 'analytics') {
        const [revenue, demand] = await Promise.all([
          getRevenueAnalytics(),
          getServiceDemandAnalytics(),
        ]);
        setAnalytics({ revenue: revenue.data, demand: demand.data });
        toast.success('Analytics loaded successfully');
      } else if (activeTab === 'my-bookings' || activeTab === 'payments') {
        // Load user's own bookings for "My Bookings" and "Payment History" tabs
        try {
          const response = await getMyBookings();
          setMyBookings(response.data || []);
          toast.success('Bookings loaded successfully');
        } catch (err) {
          toast.error(err.message || 'Failed to load bookings');
          setMyBookings([]);
        }
      } else if (activeTab === 'profile') {
        // Profile tab doesn't need data loading, just set profile data
        setProfileData({
          name: user?.displayName || '',
          email: user?.email || '',
        });
      }
    } catch (err) {
      console.error('Error loading data:', err);
      toast.error(err.message || 'Failed to load data');
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
      toast.success('Service created successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to create service');
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
      toast.success('Service updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update service');
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }
    try {
      const loadingToast = toast.loading('Deleting service...');
      await deleteService(id);
      loadData();
      toast.success('Service deleted successfully', { id: loadingToast });
    } catch (err) {
      toast.error(err.message || 'Failed to delete service');
    }
  };

  const handleAssignDecorator = async (bookingId) => {
    if (!selectedDecoratorId) {
      toast.error('Please select a decorator');
      return;
    }
    const loadingToast = toast.loading('Assigning decorator...');
    try {
      await assignDecorator(bookingId, selectedDecoratorId);
      setSelectedBooking(null);
      setSelectedDecoratorId('');
      loadData();
      toast.success('Decorator assigned successfully', { id: loadingToast });
    } catch (err) {
      toast.error(err.message || 'Failed to assign decorator', { id: loadingToast });
    }
  };

  const handleMakeDecorator = async () => {
    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }
    if (decoratorSpecialties.length === 0) {
      toast.error('Please add at least one specialty');
      return;
    }
    const loadingToast = toast.loading('Converting user to decorator...');
    try {
      console.log('Making user decorator:', { 
        userId: selectedUserId, 
        specialties: decoratorSpecialties,
        specialtiesType: typeof decoratorSpecialties,
        isArray: Array.isArray(decoratorSpecialties)
      });
      
      const response = await makeUserDecorator(selectedUserId, decoratorSpecialties);
      console.log('Make decorator response:', response);
      
      // Clear form
      setSelectedUserId('');
      setDecoratorSpecialties([]);
      
      // Reload data to refresh users and decorators lists
      await loadData();
      
      toast.success('User converted to decorator successfully. They will appear in the decorators list with "pending" status.', { id: loadingToast, duration: 5000 });
    } catch (err) {
      console.error('Error making user decorator:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        userId: selectedUserId,
        specialties: decoratorSpecialties
      });
      
      // Show more detailed error message
      const errorMessage = err.message || 'Failed to convert user';
      toast.error(`Error: ${errorMessage}`, { id: loadingToast, duration: 6000 });
    }
  };

  const handleApproveDecorator = async (decoratorId) => {
    const loadingToast = toast.loading('Approving decorator...');
    try {
      await approveDecorator(decoratorId);
      loadData();
      toast.success('Decorator approved successfully', { id: loadingToast });
    } catch (err) {
      toast.error(err.message || 'Failed to approve decorator', { id: loadingToast });
    }
  };

  const handleDisableDecorator = async (decoratorId) => {
    if (!window.confirm('Are you sure you want to disable this decorator?')) {
      return;
    }
    const loadingToast = toast.loading('Disabling decorator...');
    try {
      await disableDecorator(decoratorId);
      loadData();
      toast.success('Decorator disabled successfully', { id: loadingToast });
    } catch (err) {
      toast.error(err.message || 'Failed to disable decorator', { id: loadingToast });
    }
  };

  // Filter and sort bookings
  const filteredAndSortedBookings = useMemo(() => {
    let filtered = [...bookings];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.serviceId?.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortBy === 'status') {
        const statusA = a.status || '';
        const statusB = b.status || '';
        if (sortOrder === 'asc') {
          return statusA.localeCompare(statusB);
        } else {
          return statusB.localeCompare(statusA);
        }
      }
      return 0;
    });

    return filtered;
  }, [bookings, searchTerm, sortBy, sortOrder]);

  // Pagination for bookings
  const totalPages = Math.ceil(filteredAndSortedBookings.length / ITEMS_PER_PAGE);
  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedBookings.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedBookings, currentPage]);

  // Filter services
  const filteredServices = useMemo(() => {
    if (!serviceSearchTerm) return services;
    return services.filter(service =>
      service.service_name?.toLowerCase().includes(serviceSearchTerm.toLowerCase()) ||
      service.category?.toLowerCase().includes(serviceSearchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(serviceSearchTerm.toLowerCase())
    );
  }, [services, serviceSearchTerm]);

  // Filter decorators
  const filteredDecorators = useMemo(() => {
    if (!decoratorSearchTerm) return decorators;
    return decorators.filter(decorator =>
      decorator.userId?.name?.toLowerCase().includes(decoratorSearchTerm.toLowerCase()) ||
      decorator.userId?.email?.toLowerCase().includes(decoratorSearchTerm.toLowerCase()) ||
      decorator.specialties?.some(s => s.toLowerCase().includes(decoratorSearchTerm.toLowerCase()))
    );
  }, [decorators, decoratorSearchTerm]);

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
          className={`dashboard-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          My Profile
        </button>
        <button
          className={`dashboard-tab ${activeTab === 'my-bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-bookings')}
        >
          My Bookings
        </button>
        <button
          className={`dashboard-tab ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          Payment History
        </button>
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
        {/* My Profile Tab */}
        {activeTab === 'profile' && (
          <div className="dashboard-section animate__animated animate__fadeInUp">
            <h2 className="section-heading">Profile Information</h2>
            <div className="profile-card">
              <div className="profile-avatar">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} />
                ) : (
                  <div className="avatar-placeholder">
                    {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className="profile-info">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="form-input"
                    disabled
                  />
                  <small className="form-hint">Name is managed by your authentication provider</small>
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    className="form-input form-input-disabled"
                    disabled
                  />
                </div>
                <div className="profile-stats">
                  <div className="stat-item">
                    <span className="stat-value">{myBookings.length}</span>
                    <span className="stat-label">Total Bookings</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">
                      {myBookings.filter(b => b.paymentStatus === 'paid').length}
                    </span>
                    <span className="stat-label">Paid</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">
                      {myBookings.filter(b => new Date(b.date) >= new Date() && b.status !== 'cancelled').length}
                    </span>
                    <span className="stat-label">Upcoming</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Bookings Tab */}
        {activeTab === 'my-bookings' && (
          <div className="dashboard-section animate__animated animate__fadeInUp">
            <h2 className="section-heading">My Bookings</h2>
            
            {loading ? (
              <Loading />
            ) : (
              <>
                {/* Search and Sort Controls */}
                {myBookings.length > 0 && (
                  <div className="bookings-controls">
                    <div className="search-container">
                      <input
                        type="text"
                        placeholder="Search by service name, location, or status..."
                        value={myBookingsSearchTerm}
                        onChange={(e) => {
                          setMyBookingsSearchTerm(e.target.value);
                          setMyBookingsCurrentPage(1);
                        }}
                        className="form-input search-input"
                      />
                    </div>
                    <div className="sort-container">
                      <select
                        value={myBookingsSortBy}
                        onChange={(e) => {
                          setMyBookingsSortBy(e.target.value);
                          setMyBookingsCurrentPage(1);
                        }}
                        className="form-select"
                      >
                        <option value="date">Sort by Date</option>
                        <option value="status">Sort by Status</option>
                      </select>
                      <button
                        className="btn-outline sort-order-btn"
                        onClick={() => {
                          setMyBookingsSortOrder(myBookingsSortOrder === 'asc' ? 'desc' : 'asc');
                          setMyBookingsCurrentPage(1);
                        }}
                        title={`Sort ${myBookingsSortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                      >
                        {myBookingsSortOrder === 'asc' ? '↑' : '↓'}
                      </button>
                    </div>
                  </div>
                )}

                {myBookings.length === 0 ? (
                  <div className="empty-state">
                    <p>No bookings found.</p>
                    <button className="btn-primary" onClick={() => navigate('/services')}>
                      Browse Services
                    </button>
                  </div>
                ) : (() => {
                  // Filter and sort bookings
                  let filtered = [...myBookings];
                  if (myBookingsSearchTerm) {
                    filtered = filtered.filter(booking =>
                      booking.serviceId?.service_name?.toLowerCase().includes(myBookingsSearchTerm.toLowerCase()) ||
                      booking.location?.toLowerCase().includes(myBookingsSearchTerm.toLowerCase()) ||
                      booking.status?.toLowerCase().includes(myBookingsSearchTerm.toLowerCase())
                    );
                  }
                  filtered.sort((a, b) => {
                    if (myBookingsSortBy === 'date') {
                      const dateA = new Date(a.date);
                      const dateB = new Date(b.date);
                      return myBookingsSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
                    } else if (myBookingsSortBy === 'status') {
                      const statusA = a.status || '';
                      const statusB = b.status || '';
                      if (myBookingsSortOrder === 'asc') {
                        return statusA.localeCompare(statusB);
                      } else {
                        return statusB.localeCompare(statusA);
                      }
                    }
                    return 0;
                  });
                  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
                  const startIndex = (myBookingsCurrentPage - 1) * ITEMS_PER_PAGE;
                  const paginatedBookings = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

                  return filtered.length === 0 ? (
                    <div className="empty-state">
                      <p>No bookings match your search criteria.</p>
                      <button className="btn-outline" onClick={() => setMyBookingsSearchTerm('')}>
                        Clear Search
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="bookings-grid">
                        {paginatedBookings.map((booking) => (
                          <div key={booking._id} className="booking-card">
                            <div className="booking-header">
                              <h3 className="booking-service-name">{booking.serviceId?.service_name}</h3>
                              <span className={`status-badge status-${booking.status}`}>
                                {booking.status}
                              </span>
                            </div>
                            <div className="booking-details">
                              <div className="booking-detail-item">
                                <span className="detail-label">Date & Time:</span>
                                <span className="detail-value">
                                  {new Date(booking.date).toLocaleString()}
                                </span>
                              </div>
                              <div className="booking-detail-item">
                                <span className="detail-label">Location:</span>
                                <span className="detail-value">{booking.location}</span>
                              </div>
                              <div className="booking-detail-item">
                                <span className="detail-label">Amount:</span>
                                <span className="detail-value">
                                  ${booking.serviceId?.cost} {booking.serviceId?.unit}
                                </span>
                              </div>
                              <div className="booking-detail-item">
                                <span className="detail-label">Payment:</span>
                                <span className={`payment-badge payment-${booking.paymentStatus}`}>
                                  {booking.paymentStatus}
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
                              {booking.paymentStatus === 'pending' && (
                                <button
                                  className="btn-primary"
                                  onClick={() => navigate('/payment', { state: { booking } })}
                                >
                                  Pay Now
                                </button>
                              )}
                              {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                <button
                                  className="btn-outline btn-danger"
                                  onClick={async () => {
                                    if (!window.confirm('Are you sure you want to cancel this booking?')) {
                                      return;
                                    }
                                    const loadingToast = toast.loading('Cancelling booking...');
                                    try {
                                      await cancelBooking(booking._id);
                                      setMyBookings(myBookings.filter(b => b._id !== booking._id));
                                      toast.success('Booking cancelled successfully', { id: loadingToast });
                                    } catch (err) {
                                      toast.error(err.message || 'Failed to cancel booking', { id: loadingToast });
                                    }
                                  }}
                                >
                                  Cancel Booking
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="pagination">
                          <button
                            className="btn-outline"
                            onClick={() => setMyBookingsCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={myBookingsCurrentPage === 1}
                          >
                            Previous
                          </button>
                          <span className="pagination-info">
                            Page {myBookingsCurrentPage} of {totalPages} ({filtered.length} bookings)
                          </span>
                          <button
                            className="btn-outline"
                            onClick={() => setMyBookingsCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={myBookingsCurrentPage === totalPages}
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </>
            )}
          </div>
        )}

        {/* Payment History Tab */}
        {activeTab === 'payments' && (
          <div className="dashboard-section animate__animated animate__fadeInUp">
            <h2 className="section-heading">Payment History</h2>
            {loading ? (
              <Loading />
            ) : (() => {
              const paymentHistory = myBookings.filter(b => b.paymentStatus === 'paid');
              return paymentHistory.length === 0 ? (
                <div className="empty-state">
                  <p>No payment history available.</p>
                </div>
              ) : (
                <div className="payments-list">
                  {paymentHistory.map((booking) => (
                    <div key={booking._id} className="payment-card">
                      <div className="payment-header">
                        <div>
                          <h3 className="payment-service">{booking.serviceId?.service_name}</h3>
                          <p className="payment-date">
                            Paid on {new Date(booking.updatedAt || booking.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="payment-amount">
                          ${booking.serviceId?.cost}
                        </div>
                      </div>
                      <div className="payment-details">
                        <div className="payment-detail-row">
                          <span>Booking Date:</span>
                          <span>{new Date(booking.date).toLocaleString()}</span>
                        </div>
                        <div className="payment-detail-row">
                          <span>Location:</span>
                          <span>{booking.location}</span>
                        </div>
                        <div className="payment-detail-row">
                          <span>Status:</span>
                          <span className={`status-badge status-${booking.status}`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                      <div className="payment-receipt">
                        <button
                          className="btn-outline"
                          onClick={() => {
                            const receipt = {
                              service: booking.serviceId?.service_name,
                              amount: `$${booking.serviceId?.cost} ${booking.serviceId?.unit}`,
                              date: new Date(booking.date).toLocaleString(),
                              location: booking.location,
                              paymentDate: new Date(booking.updatedAt || booking.date).toLocaleString(),
                              bookingId: booking._id,
                            };
                            toast.success('Receipt details displayed', {
                              duration: 5000,
                            });
                            alert(`Receipt:\n\nService: ${receipt.service}\nAmount: ${receipt.amount}\nBooking Date: ${receipt.date}\nLocation: ${receipt.location}\nPayment Date: ${receipt.paymentDate}\nBooking ID: ${receipt.bookingId}`);
                          }}
                        >
                          View Receipt
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="dashboard-section animate__animated animate__fadeInUp">
            <h2 className="section-heading">All Bookings</h2>
            
            {/* Search and Sort Controls */}
            {bookings.length > 0 && (
              <div className="bookings-controls">
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Search by service, user, location, or status..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="form-input search-input"
                  />
                </div>
                <div className="sort-container">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="form-select"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="status">Sort by Status</option>
                  </select>
                  <button
                    className="btn-outline sort-order-btn"
                    onClick={() => {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      setCurrentPage(1);
                    }}
                    title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
            )}

            {bookings.length === 0 ? (
              <div className="empty-state">
                <p>No bookings found.</p>
              </div>
            ) : filteredAndSortedBookings.length === 0 ? (
              <div className="empty-state">
                <p>No bookings match your search criteria.</p>
                <button className="btn-outline" onClick={() => setSearchTerm('')}>
                  Clear Search
                </button>
              </div>
            ) : (
              <>
                <div className="bookings-grid">
                  {paginatedBookings.map((booking) => (
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
                          {decorators.filter(d => d.status === 'approved').length === 0 ? (
                            <div className="assign-decorator-message">
                              <p>No approved decorators available. Please approve decorators first.</p>
                            </div>
                          ) : (
                            <>
                              <select
                                value={selectedDecoratorId}
                                onChange={(e) => setSelectedDecoratorId(e.target.value)}
                                className="assign-decorator-select"
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
                              <div className="assign-decorator-buttons">
                                <button
                                  className="btn-primary btn-small"
                                  onClick={() => handleAssignDecorator(booking._id)}
                                  disabled={!selectedDecoratorId || decorators.filter(d => d.status === 'approved').length === 0}
                                >
                                  Confirm
                                </button>
                                <button
                                  className="btn-outline btn-small"
                                  onClick={() => {
                                    setSelectedBooking(null);
                                    setSelectedDecoratorId('');
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      className="btn-outline"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    <span className="pagination-info">
                      Page {currentPage} of {totalPages} ({filteredAndSortedBookings.length} bookings)
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
              </>
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
            
            {/* Search Services */}
            {services.length > 0 && (
              <div className="search-container" style={{ marginBottom: '1.5rem' }}>
                <input
                  type="text"
                  placeholder="Search services by name, category, or description..."
                  value={serviceSearchTerm}
                  onChange={(e) => setServiceSearchTerm(e.target.value)}
                  className="form-input search-input"
                />
              </div>
            )}

            {services.length === 0 ? (
              <div className="empty-state">
                <p>No services found.</p>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="empty-state">
                <p>No services match your search criteria.</p>
                <button className="btn-outline" onClick={() => setServiceSearchTerm('')}>
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="services-grid">
                {filteredServices.map((service) => (
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
                      .filter(u => u.role === 'user')
                      .map(user => (
                        <option key={user._id} value={user._id}>
                          {user.name || user.email} ({user.email})
                        </option>
                      ))}
                  </select>
                  {users.filter(u => u.role === 'user').length === 0 && (
                    <p style={{ 
                      marginTop: '0.5rem', 
                      fontSize: '0.875rem', 
                      color: 'var(--gray-dark)',
                      fontStyle: 'italic'
                    }}>
                      No regular users available to convert to decorator.
                    </p>
                  )}
                </div>
                <div className="form-group form-group-full">
                  <label className="form-label">Specialties (select one or more)</label>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                    gap: '0.75rem',
                    marginTop: '0.5rem'
                  }}>
                    {['interior', 'exterior', 'event', 'commercial', 'residential', 'other'].map((category) => (
                      <label
                        key={category}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          cursor: 'pointer',
                          padding: '0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--beige)',
                          backgroundColor: decoratorSpecialties.includes(category) 
                            ? 'var(--magenta-light)' 
                            : 'transparent',
                          transition: 'all 0.2s'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={decoratorSpecialties.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDecoratorSpecialties([...decoratorSpecialties, category]);
                            } else {
                              setDecoratorSpecialties(decoratorSpecialties.filter(s => s !== category));
                            }
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                        <span style={{ 
                          textTransform: 'capitalize',
                          fontSize: '0.9rem',
                          color: decoratorSpecialties.includes(category) 
                            ? 'var(--burgundy-dark)' 
                            : 'var(--gray-dark)'
                        }}>
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                  {decoratorSpecialties.length > 0 && (
                    <div style={{ 
                      marginTop: '0.75rem', 
                      fontSize: '0.875rem', 
                      color: 'var(--gray-dark)',
                      fontStyle: 'italic'
                    }}>
                      Selected: {decoratorSpecialties.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}
                    </div>
                  )}
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
            <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '2px solid var(--beige)' }}>
              <h3 className="section-subheading">All Decorators ({decorators.length})</h3>
              
              {/* Search Decorators */}
              {decorators.length > 0 && (
                <div className="search-container" style={{ marginBottom: '1.5rem' }}>
                  <input
                    type="text"
                    placeholder="Search decorators by name, email, or specialty..."
                    value={decoratorSearchTerm}
                    onChange={(e) => setDecoratorSearchTerm(e.target.value)}
                    className="form-input search-input"
                  />
                </div>
              )}

              {loading && activeTab === 'decorators' ? (
                <Loading />
              ) : decorators.length === 0 ? (
                <div className="empty-state">
                  <p>No decorators found. Create decorators by converting users to decorators above.</p>
                </div>
              ) : filteredDecorators.length === 0 ? (
                <div className="empty-state">
                  <p>No decorators match your search criteria.</p>
                  <button className="btn-outline" onClick={() => setDecoratorSearchTerm('')}>
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="decorators-grid">
                  {filteredDecorators.map((decorator) => (
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
