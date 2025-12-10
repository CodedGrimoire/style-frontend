import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyBookings, cancelBooking } from '../services/api';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';
import '../styles/dashboard.css';
import 'animate.css';

const ITEMS_PER_PAGE = 5;

const UserDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date' or 'status'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [currentPage, setCurrentPage] = useState(1);
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
    setError(null);
    setSearchTerm('');
    setSortBy('date');
    setSortOrder('desc');
    setCurrentPage(1);
    setLoading(true);

    setProfileData({
      name: user?.displayName || '',
      email: user?.email || '',
    });

    const fetchBookings = async () => {
      setLoading(true);
      try {
        const response = await getMyBookings();
        setBookings(response.data || []);
        toast.success('Bookings loaded successfully');
      } catch (err) {
        setError(err.message);
        toast.error(err.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, navigate]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    const loadingToast = toast.loading('Cancelling booking...');
    try {
      await cancelBooking(bookingId);
      setBookings(bookings.filter(b => b._id !== bookingId));
      toast.success('Booking cancelled successfully', { id: loadingToast });
    } catch (err) {
      toast.error(err.message || 'Failed to cancel booking', { id: loadingToast });
    }
  };

  const handlePayment = (booking) => {
    if (booking.paymentStatus === 'pending') {
      navigate('/payment', { state: { booking } });
    }
  };

  // Filter and sort bookings
  const filteredAndSortedBookings = useMemo(() => {
    let filtered = [...bookings];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.serviceId?.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedBookings.length / ITEMS_PER_PAGE);
  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedBookings.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedBookings, currentPage]);

  const getPaymentHistory = () => {
    return bookings.filter(b => b.paymentStatus === 'paid');
  };

  const getUpcomingBookings = () => {
    const now = new Date();
    return bookings.filter(b => new Date(b.date) >= now && b.status !== 'cancelled');
  };

  if (loading) return <Loading />;
  if (error) return <div className="error-container">Error: {error}</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">My Dashboard</h1>
        <p className="dashboard-subtitle">Manage your bookings and profile</p>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`dashboard-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          My Profile
        </button>
        <button
          className={`dashboard-tab ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          My Bookings
        </button>
        <button
          className={`dashboard-tab ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          Payment History
        </button>
      </div>

      <div className="dashboard-content">
        {/* Profile Tab */}
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
                    <span className="stat-value">{bookings.length}</span>
                    <span className="stat-label">Total Bookings</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">
                      {bookings.filter(b => b.paymentStatus === 'paid').length}
                    </span>
                    <span className="stat-label">Paid</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">
                      {getUpcomingBookings().length}
                    </span>
                    <span className="stat-label">Upcoming</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="dashboard-section animate__animated animate__fadeInUp">
            <h2 className="section-heading">My Bookings</h2>
            
            {/* Search and Sort Controls */}
            {bookings.length > 0 && (
              <div className="bookings-controls">
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Search by service name, location, or status..."
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
                <button className="btn-primary" onClick={() => navigate('/services')}>
                  Browse Services
                </button>
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
                            onClick={() => handlePayment(booking)}
                          >
                            Pay Now
                          </button>
                        )}
                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                          <button
                            className="btn-outline btn-danger"
                            onClick={() => handleCancel(booking._id)}
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

        {/* Payment History Tab */}
        {activeTab === 'payments' && (
          <div className="dashboard-section animate__animated animate__fadeInUp">
            <h2 className="section-heading">Payment History</h2>
            {getPaymentHistory().length === 0 ? (
              <div className="empty-state">
                <p>No payment history available.</p>
              </div>
            ) : (
              <div className="payments-list">
                {getPaymentHistory().map((booking) => (
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
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboardPage;
