import { auth } from '../../firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

// Get Firebase token for authentication
const getAuthToken = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
};

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  const token = await getAuthToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API request failed' }));
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
};

// Public endpoints
export const getServices = (category = null) => {
  const query = category ? `?category=${category}` : '';
  return apiRequest(`/services${query}`);
};

export const getServiceById = (id) => {
  return apiRequest(`/services/${id}`);
};

// User endpoints
export const createBooking = (bookingData) => {
  return apiRequest('/bookings', {
    method: 'POST',
    body: bookingData,
  });
};

export const getMyBookings = () => {
  return apiRequest('/bookings/me');
};

export const cancelBooking = (id) => {
  return apiRequest(`/bookings/${id}`, {
    method: 'DELETE',
  });
};

// Payment endpoints
export const createPaymentIntent = (bookingId) => {
  return apiRequest('/payments/create-intent', {
    method: 'POST',
    body: { bookingId },
  });
};

export const confirmPayment = (paymentId) => {
  return apiRequest('/payments/confirm', {
    method: 'POST',
    body: { paymentId },
  });
};

// Decorator endpoints
export const getDecoratorProjects = () => {
  return apiRequest('/decorator/projects');
};

export const updateProjectStatus = (bookingId, status) => {
  return apiRequest(`/decorator/project/${bookingId}/status`, {
    method: 'PUT',
    body: { status },
  });
};

// Admin endpoints
export const createService = (serviceData) => {
  return apiRequest('/admin/services', {
    method: 'POST',
    body: serviceData,
  });
};

export const updateService = (id, serviceData) => {
  return apiRequest(`/admin/services/${id}`, {
    method: 'PUT',
    body: serviceData,
  });
};

export const deleteService = (id) => {
  return apiRequest(`/admin/services/${id}`, {
    method: 'DELETE',
  });
};

export const getAllBookings = (filters = {}) => {
  const queryParams = new URLSearchParams();
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.paymentStatus) queryParams.append('paymentStatus', filters.paymentStatus);
  const query = queryParams.toString();
  return apiRequest(`/admin/bookings${query ? `?${query}` : ''}`);
};

export const assignDecorator = (bookingId, decoratorId) => {
  return apiRequest(`/admin/bookings/${bookingId}/assign`, {
    method: 'PUT',
    body: { decoratorId },
  });
};

export const makeUserDecorator = (userId, specialties) => {
  return apiRequest(`/admin/users/${userId}/make-decorator`, {
    method: 'PUT',
    body: { specialties },
  });
};

export const approveDecorator = (decoratorId) => {
  return apiRequest(`/admin/decorators/${decoratorId}/approve`, {
    method: 'PUT',
  });
};

export const disableDecorator = (decoratorId) => {
  return apiRequest(`/admin/decorators/${decoratorId}/disable`, {
    method: 'PUT',
  });
};

export const getRevenueAnalytics = (startDate = null, endDate = null) => {
  const queryParams = new URLSearchParams();
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  const query = queryParams.toString();
  return apiRequest(`/admin/analytics/revenue${query ? `?${query}` : ''}`);
};

export const getServiceDemandAnalytics = () => {
  return apiRequest('/admin/analytics/service-demand');
};

