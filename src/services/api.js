import { auth } from '../../firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

// Get Firebase JWT token for authentication
// getIdToken() automatically refreshes expired tokens
const getAuthToken = async (forceRefresh = false) => {
  const user = auth.currentUser;
  if (!user) return null;
  // forceRefresh: true to force token refresh (useful after 401 errors)
  return user.getIdToken(forceRefresh);
};

// API request helper with automatic token refresh on 401
const apiRequest = async (endpoint, options = {}, retryCount = 0) => {
  const token = await getAuthToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // Only include Authorization header if we have a token
      // Public endpoints don't need it, but it's harmless to include
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  // Handle 401 Unauthorized - token might be expired, try refreshing once
  if (response.status === 401 && retryCount === 0 && token) {
    console.log('Token expired, refreshing...');
    const refreshedToken = await getAuthToken(true); // Force refresh
    if (refreshedToken) {
      // Retry the request with refreshed token
      return apiRequest(endpoint, options, retryCount + 1);
    }
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API request failed' }));
    const errorMessage = error.message || 'API request failed';
    
    // Handle "User not found" error - this means the backend needs user profile creation
    if (errorMessage.includes('User not found') || errorMessage.includes('profile registration')) {
      throw new Error('USER_PROFILE_REQUIRED: ' + errorMessage);
    }
    
    // Handle authentication errors
    if (response.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    }
    
    throw new Error(errorMessage);
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

// User registration/profile creation
// Note: This endpoint might not exist - the backend may auto-create users
// This is a placeholder in case the backend needs explicit registration
export const registerUser = async (userData) => {
  try {
    return await apiRequest('/users/register', {
      method: 'POST',
      body: userData,
    });
  } catch (error) {
    // If endpoint doesn't exist, that's okay - backend might auto-create
    console.warn('User registration endpoint not available:', error.message);
    return null;
  }
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

// Get all decorators (admin only)
export const getAllDecorators = () => {
  return apiRequest('/admin/decorators');
};

// Get all users (admin only)
export const getAllUsers = () => {
  return apiRequest('/admin/users');
};

// Public decorator endpoints (if available)
// Note: This endpoint might not exist - placeholder for future implementation
export const getTopDecorators = async () => {
  try {
    // Try public endpoint first
    return await apiRequest('/decorators/top');
  } catch (error) {
    // If endpoint doesn't exist, return empty array
    console.warn('Top decorators endpoint not available:', error.message);
    return { data: [] };
  }
};

