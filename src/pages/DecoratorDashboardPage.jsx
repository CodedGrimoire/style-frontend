import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDecoratorProjects, updateProjectStatus, getMyBookings, cancelBooking } from '../services/api';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';
import '../styles/dashboard.css';
import 'animate.css';

const ITEMS_PER_PAGE = 5;

const DecoratorDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [earnings, setEarnings] = useState(0);
  const [todaySchedule, setTodaySchedule] = useState([]);
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
    setProjects([]);
    setEarnings(0);
    setTodaySchedule([]);
    setError(null);
    setLoading(true);
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

    const fetchData = async () => {
      setLoading(true);
      try {
        // Always fetch projects for decorator
        const projectsResponse = await getDecoratorProjects();
        const allProjects = projectsResponse.data || [];
        setProjects(allProjects);
        
        // Calculate earnings from completed projects
        const completed = allProjects.filter(
          p => p.status === 'completed' && p.paymentStatus === 'paid'
        );
        const total = completed.reduce((sum, p) => sum + (p.serviceId?.cost || 0), 0);
        setEarnings(total);

        // Get today's schedule
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayProjects = allProjects.filter(p => {
          const projectDate = new Date(p.date);
          return projectDate >= today && projectDate < tomorrow && p.status !== 'cancelled';
        });
        setTodaySchedule(todayProjects);

        // Fetch user bookings if on my-bookings or payments tab
        if (activeTab === 'my-bookings' || activeTab === 'payments') {
          try {
            const bookingsResponse = await getMyBookings();
            setMyBookings(bookingsResponse.data || []);
          } catch (err) {
            console.error('Error loading bookings:', err);
            setMyBookings([]);
          }
        }

        toast.success('Data loaded successfully');
      } catch (err) {
        setError(err.message);
        toast.error(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    const fetchProjects = async () => {
      try {
        const response = await getDecoratorProjects();
        const allProjects = response.data || [];
        setProjects(allProjects);
        
        // Calculate earnings from completed projects
        const completed = allProjects.filter(
          p => p.status === 'completed' && p.paymentStatus === 'paid'
        );
        const total = completed.reduce((sum, p) => sum + (p.serviceId?.cost || 0), 0);
        setEarnings(total);

        // Get today's schedule
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayProjects = allProjects.filter(p => {
          const projectDate = new Date(p.date);
          return projectDate >= today && projectDate < tomorrow && p.status !== 'cancelled';
        });
        setTodaySchedule(todayProjects);
        toast.success('Projects loaded successfully');
      } catch (err) {
        setError(err.message);
        toast.error(err.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'projects' || activeTab === 'schedule') {
      fetchProjects();
    } else {
      fetchData();
    }
  }, [user, navigate, activeTab]);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    const loadingToast = toast.loading('Updating project status...');
    try {
      await updateProjectStatus(bookingId, newStatus);
      const response = await getDecoratorProjects();
      const allProjects = response.data || [];
      setProjects(allProjects);
      
      // Recalculate earnings
      const completed = allProjects.filter(
        p => p.status === 'completed' && p.paymentStatus === 'paid'
      );
      const total = completed.reduce((sum, p) => sum + (p.serviceId?.cost || 0), 0);
      setEarnings(total);

      // Update today's schedule
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const todayProjects = allProjects.filter(p => {
        const projectDate = new Date(p.date);
        return projectDate >= today && projectDate < tomorrow && p.status !== 'cancelled';
      });
      setTodaySchedule(todayProjects);

      toast.success('Status updated successfully', { id: loadingToast });
    } catch (err) {
      toast.error(err.message || 'Failed to update status', { id: loadingToast });
    }
  };

  const getStatusSteps = () => {
    // Return all status steps in order (always show all steps)
    return [
      { value: 'assigned', label: 'Assigned' },
      { value: 'planning-phase', label: 'Planning Phase' },
      { value: 'materials-prepared', label: 'Materials Prepared' },
      { value: 'on-the-way', label: 'On the Way to Venue' },
      { value: 'setup-in-progress', label: 'Setup in Progress' },
      { value: 'completed', label: 'Completed' },
    ];
  };

  // Map backend status to detailed flow step for display
  // This allows us to show the detailed 6-step flow even though backend only has 3 statuses
  const getDisplayStatus = (backendStatus) => {
    const statusMap = {
      'assigned': 'assigned',
      'in-progress': 'setup-in-progress', // When in-progress, show "Setup in Progress" as active
      'completed': 'completed',
      // Support any custom statuses that might come from backend
      'planning-phase': 'planning-phase',
      'planning': 'planning-phase',
      'materials-prepared': 'materials-prepared',
      'on-the-way': 'on-the-way',
      'setup-in-progress': 'setup-in-progress',
    };
    return statusMap[backendStatus] || backendStatus;
  };

  // Get which steps should be marked as completed based on current status
  const getCompletedSteps = (backendStatus) => {
    const displayStatus = getDisplayStatus(backendStatus);
    const statusOrder = ['assigned', 'planning-phase', 'materials-prepared', 'on-the-way', 'setup-in-progress', 'completed'];
    const currentIndex = statusOrder.indexOf(displayStatus);
    
    // If status is 'in-progress', mark all steps before 'setup-in-progress' as completed
    if (backendStatus === 'in-progress') {
      return statusOrder.slice(0, statusOrder.indexOf('setup-in-progress'));
    }
    
    // Otherwise, mark all steps before current as completed
    return currentIndex > 0 ? statusOrder.slice(0, currentIndex) : [];
  };

  // Get the next backend status to send
  const getNextBackendStatus = (currentStatus) => {
    // Map detailed flow statuses to backend statuses
    if (currentStatus === 'assigned') {
      return 'in-progress'; // Move from assigned to in-progress
    } else if (currentStatus === 'in-progress') {
      return 'completed'; // Move from in-progress to completed
    } else if (currentStatus === 'completed') {
      return null; // Already completed
    }
    // For any other status, try to map to next backend status
    const detailedToBackend = {
      'planning-phase': 'in-progress',
      'materials-prepared': 'in-progress',
      'on-the-way': 'in-progress',
      'setup-in-progress': 'completed',
    };
    return detailedToBackend[currentStatus] || 'in-progress';
  };

  if (loading && (activeTab === 'projects' || activeTab === 'schedule')) return <Loading />;
  if (error) return <div className="error-container">Error: {error}</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Decorator Dashboard</h1>
        <p className="dashboard-subtitle">Manage your assigned projects and track your earnings</p>
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
          className={`dashboard-tab ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          My Projects
        </button>
        <button
          className={`dashboard-tab ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          Today's Schedule
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

        {/* My Bookings Tab - Same as Admin Dashboard */}
        {activeTab === 'my-bookings' && (
          <div className="dashboard-section animate__animated animate__fadeInUp">
            <h2 className="section-heading">My Bookings</h2>
            
            {loading ? (
              <Loading />
            ) : (
              <>
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

        {/* My Projects Tab */}
        {activeTab === 'projects' && (
          <>
            {/* Earnings Summary */}
        <div className="dashboard-section animate__animated animate__fadeInUp">
          <h2 className="section-heading">Earnings Summary</h2>
          <div className="earnings-summary">
            <div className="earnings-stat">
              <span className="earnings-label">Total Earnings</span>
              <span className="earnings-value">${earnings.toFixed(2)}</span>
            </div>
            <div className="earnings-stat">
              <span className="earnings-label">Completed Projects</span>
              <span className="earnings-value">
                {projects.filter(p => p.status === 'completed' && p.paymentStatus === 'paid').length}
              </span>
            </div>
            <div className="earnings-stat">
              <span className="earnings-label">Active Projects</span>
              <span className="earnings-value">
                {projects.filter(p => p.status !== 'completed' && p.status !== 'cancelled').length}
              </span>
            </div>
          </div>
        </div>

            {/* Assigned Projects */}
        <div className="dashboard-section animate__animated animate__fadeInUp">
          <h2 className="section-heading">My Assigned Projects</h2>
          {projects.length === 0 ? (
            <div className="empty-state">
              <p>No projects assigned yet.</p>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => (
                <div key={project._id} className="project-card">
                  <div className="project-header">
                    <h3 className="project-service-name">{project.serviceId?.service_name}</h3>
                    <span className={`status-badge status-${project.status}`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="project-details">
                    <div className="project-detail-item">
                      <span className="detail-label">Client:</span>
                      <span className="detail-value">
                        {project.userId?.name || project.userId?.email || project.userId || 'Unknown'}
                      </span>
                    </div>
                    <div className="project-detail-item">
                      <span className="detail-label">Date & Time:</span>
                      <span className="detail-value">
                        {new Date(project.date).toLocaleString()}
                      </span>
                    </div>
                    <div className="project-detail-item">
                      <span className="detail-label">Location:</span>
                      <span className="detail-value">{project.location}</span>
                    </div>
                    <div className="project-detail-item">
                      <span className="detail-label">Payment Status:</span>
                      <span className={`payment-badge payment-${project.paymentStatus}`}>
                        {project.paymentStatus}
                      </span>
                    </div>
                    <div className="project-detail-item">
                      <span className="detail-label">Amount:</span>
                      <span className="detail-value">
                        ${project.serviceId?.cost} {project.serviceId?.unit}
                      </span>
                    </div>
                  </div>

                  {/* Status Steps - On-Site Service Status Flow */}
                  <div className="project-status-steps">
                    <h4 className="status-steps-title">On-Site Service Status Flow</h4>
                    <div className="status-steps">
                      {getStatusSteps().map((step, index) => {
                        const displayStatus = getDisplayStatus(project.status);
                        const completedSteps = getCompletedSteps(project.status);
                        const statusOrder = ['assigned', 'planning-phase', 'materials-prepared', 'on-the-way', 'setup-in-progress', 'completed'];
                        const currentIndex = statusOrder.indexOf(displayStatus);
                        const stepIndex = statusOrder.indexOf(step.value);
                        
                        // Determine if step is active, completed, or pending
                        const isActive = step.value === displayStatus;
                        const isCompleted = completedSteps.includes(step.value) || (stepIndex !== -1 && currentIndex !== -1 && stepIndex < currentIndex);
                        const isPending = stepIndex !== -1 && currentIndex !== -1 && stepIndex > currentIndex && !isCompleted;
                        
                        return (
                          <div
                            key={step.value}
                            className={`status-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isPending ? 'pending' : ''}`}
                            title={step.label}
                          >
                            <div className="status-step-circle">
                              {isCompleted ? '✓' : isActive ? '●' : index + 1}
                            </div>
                            <span className="status-step-label">{step.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Update Status Actions */}
                  <div className="project-actions">
                    {project.status !== 'completed' && getNextBackendStatus(project.status) && (
                      <button
                        className="btn-primary"
                        onClick={() => handleStatusUpdate(project._id, getNextBackendStatus(project.status))}
                      >
                        {project.status === 'assigned' ? 'Start Planning Phase' : 
                       project.status === 'in-progress' ? 'Mark as Completed' :
                       'Next Step'}
                      </button>
                    )}
                    {project.status === 'completed' && (
                      <span className="project-completed-badge">✓ Project Completed</span>
                    )}
                  </div>

                  {/* Payment History */}
                  {project.paymentStatus === 'paid' && (
                    <div className="project-payment-info">
                      <p className="payment-info-text">
                        Payment received: ${project.serviceId?.cost} {project.serviceId?.unit}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
            </div>
          </>
        )}

        {/* Today's Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="dashboard-section animate__animated animate__fadeInUp">
            <h2 className="section-heading">Today's Schedule</h2>
            {todaySchedule.length === 0 ? (
              <div className="empty-state">
                <p>No projects scheduled for today.</p>
              </div>
            ) : (
              <div className="schedule-list">
                {todaySchedule.map((project) => (
                  <div key={project._id} className="schedule-item">
                    <div className="schedule-time">
                      {new Date(project.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="schedule-details">
                      <h4 className="schedule-service">{project.serviceId?.service_name}</h4>
                      <p className="schedule-location">{project.location}</p>
                      <p className="schedule-client">Client: {project.userId?.email || project.userId}</p>
                    </div>
                    <div className="schedule-status">
                      <span className={`status-badge status-${project.status}`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DecoratorDashboardPage;
