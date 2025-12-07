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
      // Check if we can auto-register (only if this isn't already a registration request and we haven't retried too many times)
      if (!endpoint.includes('/register') && auth.currentUser && retryCount < 2) {
        const currentUser = auth.currentUser;
        try {
          console.log('User profile not found, attempting automatic registration...');
          console.log('User email:', currentUser.email);
          console.log('User displayName:', currentUser.displayName);
          
          // Get a fresh token
          const token = await currentUser.getIdToken(true);
          if (!token) {
            throw new Error('Failed to get authentication token');
          }
          
          // Get user name - prefer displayName, fallback to email prefix, but ensure it's valid
          let userName = currentUser.displayName;
          if (!userName || userName.trim().length === 0) {
            userName = currentUser.email?.split('@')[0];
          }
          // If still no valid name, use email prefix (should always exist)
          if (!userName || userName.trim().length === 0) {
            userName = currentUser.email?.split('@')[0] || 'User';
          }
          userName = userName.trim();
          
          console.log('Registering with name:', userName);
          
          // Make a direct registration request to avoid circular dependency
          const regResponse = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: userName,
              role: 'user',
              image: currentUser.photoURL || null,
            }),
          });
          
          console.log('Registration response status:', regResponse.status);
          
          if (regResponse.ok) {
            const regData = await regResponse.json();
            console.log('Automatic registration successful:', regData);
            // Retry the original request after registration (increment retry count to prevent infinite loops)
            return apiRequest(endpoint, options, retryCount + 1);
          } else {
            const regErrorText = await regResponse.text();
            let regError;
            try {
              regError = JSON.parse(regErrorText);
            } catch {
              regError = { message: regErrorText || 'Registration failed' };
            }
            console.error('Automatic registration response:', regError);
            console.error('Response status:', regResponse.status);
            console.error('Response body:', regErrorText);
            
            // If email is already registered, it means the user exists in the backend
            // This might be a token/ID mismatch, but the user profile exists
            // Try refreshing the token and retrying the original request
            if (regError.message && regError.message.includes('already registered')) {
              console.log('User already exists in backend (email registered). This might be a token/ID mismatch.');
              console.log('Refreshing token and retrying original request...');
              
              // Force refresh the token to ensure we have the latest one
              await currentUser.getIdToken(true);
              
              // Wait a bit for backend to sync, then retry
              await new Promise(resolve => setTimeout(resolve, 500));
              
              // Retry the original request with fresh token
              return apiRequest(endpoint, options, retryCount + 1);
            }
            
            throw new Error('USER_PROFILE_REQUIRED: ' + errorMessage + '. Registration failed: ' + (regError.message || 'Unknown error'));
          }
        } catch (regError) {
          console.error('Automatic registration error:', regError);
          console.error('Error details:', {
            message: regError.message,
            stack: regError.stack,
            name: regError.name
          });
          throw new Error('USER_PROFILE_REQUIRED: ' + errorMessage + '. Please complete your profile registration. Error: ' + regError.message);
        }
      } else {
        throw new Error('USER_PROFILE_REQUIRED: ' + errorMessage);
      }
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
// POST /register - Creates user profile in backend after Firebase authentication
// Request body: { name (required), role (optional, defaults to 'user'), image (optional) }
// Email and firebaseUid are extracted from the JWT token
// Returns 201 Created for new users, 200 OK for existing users (idempotent)
// Note: This function makes a direct fetch call to avoid circular dependency with apiRequest
export const registerUser = async (name, role = 'user', image = null) => {
  try {
    if (!name || name.trim().length === 0) {
      throw new Error('Name is required.');
    }

    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user found. Please log in first.');
    }

    // Get a fresh token
    const token = await user.getIdToken(true);
    if (!token) {
      throw new Error('Failed to get authentication token');
    }

    console.log('Registering user with:', { name: name.trim(), role, email: user.email });

    // Make a direct fetch call to avoid circular dependency with apiRequest
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: name.trim(),
        role,
        image,
      }),
    });

    console.log('Registration response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
      const errorMessage = errorData.message || 'Registration failed';
      console.error('Registration failed:', errorMessage, 'Status:', response.status);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // The endpoint returns 200 OK if user already exists (idempotent)
    // or 201 Created for new users - both are success cases
    // Response format: { success: true, message: "...", data: {...} }
    return data.data || data;
  } catch (error) {
    // Re-throw specific errors
    console.error('User registration error:', error);
    throw error;
  }
};

// User endpoints
export const getCurrentUser = async () => {
  try {
    // Try to get user profile - the register endpoint returns existing user if already registered
    // This is a workaround since there might not be a dedicated /users/me endpoint
    const user = auth.currentUser;
    if (!user) return null;
    
    // We'll use the register endpoint which is idempotent and returns the user profile
    // But first, let's try a direct profile endpoint if it exists
    try {
      return await apiRequest('/users/me');
    } catch (error) {
      // If /users/me doesn't exist, we'll need to get profile from registration response
      // For now, return null and let the component handle it
      console.log('User profile endpoint not available, will fetch from registration');
      return null;
    }
  } catch (error) {
    console.warn('Failed to get current user profile:', error.message);
    return null;
  }
};

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
export const getAllDecorators = async () => {
  try {
    return await apiRequest('/admin/decorators');
  } catch (error) {
    console.warn('Get all decorators endpoint not available:', error.message);
    return { data: [] };
  }
};

// Get all users (admin only)
export const getAllUsers = async () => {
  try {
    return await apiRequest('/admin/users');
  } catch (error) {
    console.warn('Get all users endpoint not available:', error.message);
    return { data: [] };
  }
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

