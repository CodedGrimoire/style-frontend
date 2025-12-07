import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyBookings, cancelBooking } from '../services/api';
import Loading from '../components/Loading';
import '../styles/dashboard.css';
import 'animate.css';

const UserDashboardPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    setProfileData({
      name: user?.displayName || '',
      email: user?.email || '',
    });

    const fetchBookings = async () => {
      try {
        const response = await getMyBookings();
        setBookings(response.data || []);
      } catch (err) {
        setError(err.message);
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

    try {
      await cancelBooking(bookingId);
      setBookings(bookings.filter(b => b._id !== bookingId));
      alert('Booking cancelled successfully');
    } catch (err) {
      alert(`Error cancelling booking: ${err.message}`);
    }
  };

  const handlePayment = (booking) => {
    if (booking.paymentStatus === 'pending') {
      navigate('/payment', { state: { booking } });
    }
  };

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
            {bookings.length === 0 ? (
              <div className="empty-state">
                <p>No bookings found.</p>
                <button className="btn-primary" onClick={() => navigate('/services')}>
                  Browse Services
                </button>
              </div>
            ) : (
              <div className="bookings-grid">
                {bookings.map((booking) => (
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
                          // Generate receipt (can be enhanced with PDF generation)
                          const receipt = {
                            service: booking.serviceId?.service_name,
                            amount: `$${booking.serviceId?.cost} ${booking.serviceId?.unit}`,
                            date: new Date(booking.date).toLocaleString(),
                            location: booking.location,
                            paymentDate: new Date(booking.updatedAt || booking.date).toLocaleString(),
                            bookingId: booking._id,
                          };
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
