import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createBooking } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/modal.css';

const BookingModal = ({ service, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [bookingDate, setBookingDate] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!bookingDate || !location) {
      toast.error('Please fill in all fields');
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Creating booking...');

    try {
      const bookingData = {
        serviceId: service._id,
        date: new Date(bookingDate).toISOString(),
        location: location,
      };

      await createBooking(bookingData);
      toast.success('Booking created successfully!', { id: loadingToast });
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to create booking', { id: loadingToast });
      setError(err.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-container">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title">Book Service</h2>
            <button className="modal-close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="booking-form">
            {/* Service Information */}
            <div className="form-section">
              <h3 className="form-section-title">Service Details</h3>
              <div className="form-info-group">
                <div className="form-info-item">
                  <span className="form-info-label">Service:</span>
                  <span className="form-info-value">{service.service_name}</span>
                </div>
                <div className="form-info-item">
                  <span className="form-info-label">Price:</span>
                  <span className="form-info-value">${service.cost} {service.unit}</span>
                </div>
                <div className="form-info-item">
                  <span className="form-info-label">Category:</span>
                  <span className="form-info-value">{service.category}</span>
                </div>
              </div>
            </div>

            {/* User Information */}
            <div className="form-section">
              <h3 className="form-section-title">Your Information</h3>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  value={user?.displayName || user?.email?.split('@')[0] || ''}
                  disabled
                  className="form-input form-input-disabled"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="form-input form-input-disabled"
                />
              </div>
            </div>

            {/* Booking Details */}
            <div className="form-section">
              <h3 className="form-section-title">Booking Details</h3>
              <div className="form-group">
                <label className="form-label">Booking Date & Time *</label>
                <input
                  type="datetime-local"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="form-input"
                  required
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Location *</label>
                <textarea
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter your full address"
                  className="form-textarea"
                  rows="4"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="form-error">
                {error}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn-outline"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default BookingModal;

