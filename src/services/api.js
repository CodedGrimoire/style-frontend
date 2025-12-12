import { auth } from '../../firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

|| 'http://localhost:5001';


const getAuthToken = async (forceRefresh = false) =>
  
  
  {
  const user = auth.currentUser;
  if (!user)
    
    
    return null;
 
  return user.getIdToken(forceRefresh);
};


const apiRequest = async (endpoint, options = {}, retryCount = 0) => 
  
  
  {
  const token = await getAuthToken();
  
  const config =
  
  
  {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  if (options.body && typeof options.body === 'object') 
    
    
    {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
 
  if (response.status === 401 && retryCount === 0 && token) 
    
    
    {
    console.log('Token expired, refreshing...');
    const refreshedToken = await getAuthToken(true); 


    if (refreshedToken) 
      
      
      {
    
      return apiRequest(endpoint, options, retryCount + 1);
    }
  }
  
  if (!response.ok)
    
    
    {

       let errorMessage;
    let error;
   
    
    try 
    {
      const errorText = await response.text();
      try 
      
      
      {
        error = JSON.parse(errorText);
        errorMessage = error.message || error.error || `HTTP ${response.status}: ${response.statusText}`;
      } 
      
      catch
      
      
      {
      
        errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
        error = { message: errorMessage };
      }
    }
    
    
    catch
    
    
    {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      error = { message: errorMessage };
    }
    
   
    console.error('API Error:', 
      
      
      {
      status: response.status,
      statusText: response.statusText,
      endpoint,
      errorMessage,
      error
    });
    
    
    if (errorMessage.includes('User not found') || errorMessage.includes('profile registration')) 
      
      
      {
     
      if (!endpoint.includes('/register') && auth.currentUser && retryCount < 2)
        
        
        {
        const currentUser = auth.currentUser;
        try 
        
        {
        //  console.log('User profile not found, attempting automatic registration...');
         // console.log('User email:', currentUser.email);
        //  console.log('User displayName:', currentUser.displayName);
          
          // Get a fresh token
          const token = await currentUser.getIdToken(true);

          
          if (!token) 
            
            
            {
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
          const regResponse = await fetch(`${API_BASE_URL}/api/register`, {
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
    
    // Handle server errors with more detail
    if (response.status >= 500) {
      throw new Error(`Server error (${response.status}): ${errorMessage}. Please check the backend logs.`);
    }
    
    throw new Error(errorMessage);
  }

  // Parse JSON response, handling empty responses
  const text = await response.text();
  if (!text || text.trim().length === 0) {
    return { success: true };
  }
  try {
    return JSON.parse(text);
  } catch (parseError) {
    console.error('Failed to parse response as JSON:', parseError);
    console.error('Response text:', text);
    throw new Error('Invalid response format from server');
  }
};

// Public endpoints (no authentication required)
export const getServices = async (category = null) => {
  try {
    const query = category ? `?category=${category}` : '';
    // Make a direct fetch call without authentication for public endpoint
    const response = await fetch(`${API_BASE_URL}/api/services${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

export const getServiceById = async (id) => {
  try {
    // Make a direct fetch call without authentication for public endpoint
    const response = await fetch(`${API_BASE_URL}/api/services/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching service:', error);
    throw error;
  }
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
    const response = await fetch(`${API_BASE_URL}/api/register`, {
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
    const user = auth.currentUser;
    if (!user) return null;
    
    // Try to get user profile from /api/users/me endpoint
    const response = await apiRequest('/api/users/me');
    // Extract data if response has a data property, otherwise return the whole response
    return response.data || response;
  } catch (error) {
    // If /api/users/me doesn't exist or fails, return null
    // Components should use registerUser instead to get/create the profile
    console.warn('Failed to get current user profile:', error.message);
    return null;
  }
};

export const createBooking = (bookingData) => {
  return apiRequest('/api/bookings', {
    method: 'POST',
    body: bookingData,
  });
};

export const getMyBookings = () => {
  return apiRequest('/api/bookings/me');
};

export const cancelBooking = (id) => {
  return apiRequest(`/api/bookings/${id}`, {
    method: 'DELETE',
  });
};

// Payment endpoints
export const createPaymentIntent = (bookingId) => {
  return apiRequest('/api/payments/create-intent', {
    method: 'POST',
    body: { bookingId },
  });
};

export const confirmPayment = (paymentId) => {
  return apiRequest('/api/payments/confirm', {
    method: 'POST',
    body: { paymentId },
  });
};

// Decorator endpoints
export const getDecoratorProjects = () => {
  return apiRequest('/api/decorator/projects');
};

export const updateProjectStatus = (bookingId, status) => {
  return apiRequest(`/api/decorator/project/${bookingId}/status`, {
    method: 'PUT',
    body: { status },
  });
};

// Admin endpoints
export const createService = (serviceData) => {
  return apiRequest('/api/admin/services', {
    method: 'POST',
    body: serviceData,
  });
};

export const updateService = (id, serviceData) => {
  return apiRequest(`/api/admin/services/${id}`, {
    method: 'PUT',
    body: serviceData,
  });
};

export const deleteService = (id) => {
  return apiRequest(`/api/admin/services/${id}`, {
    method: 'DELETE',
  });
};

export const getAllBookings = (filters = {}) => {
  const queryParams = new URLSearchParams();
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.paymentStatus) queryParams.append('paymentStatus', filters.paymentStatus);
  const query = queryParams.toString();
  return apiRequest(`/api/admin/bookings${query ? `?${query}` : ''}`);
};

export const assignDecorator = (bookingId, decoratorId) => {
  return apiRequest(`/api/admin/bookings/${bookingId}/assign`, {
    method: 'PUT',
    body: { decoratorId },
  });
};

export const makeUserDecorator = (userId, specialties) => {
  // Ensure specialties is an array
  const specialtiesArray = Array.isArray(specialties) ? specialties : [specialties].filter(Boolean);
  
  console.log('makeUserDecorator called with:', { userId, specialties, specialtiesArray });
  
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  if (!specialtiesArray || specialtiesArray.length === 0) {
    throw new Error('At least one specialty is required');
  }
  
  return apiRequest(`/api/admin/users/${userId}/make-decorator`, {
    method: 'PUT',
    body: { specialties: specialtiesArray },
  });
};

export const approveDecorator = (decoratorId) => {
  return apiRequest(`/api/admin/decorators/${decoratorId}/approve`, {
    method: 'PUT',
  });
};

export const disableDecorator = (decoratorId) => {
  return apiRequest(`/api/admin/decorators/${decoratorId}/disable`, {
    method: 'PUT',
  });
};

export const getRevenueAnalytics = (startDate = null, endDate = null) => {
  const queryParams = new URLSearchParams();
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  const query = queryParams.toString();
  return apiRequest(`/api/admin/analytics/revenue${query ? `?${query}` : ''}`);
};

export const getServiceDemandAnalytics = () => {
  return apiRequest('/api/admin/analytics/service-demand');
};

// Get all decorators (admin only)
export const getAllDecorators = async () => {
  try {
    return await apiRequest('/api/admin/decorators');
  } catch (error) {
    console.warn('Get all decorators endpoint not available:', error.message);
    return { data: [] };
  }
};

// Get all users (admin only)
export const getAllUsers = async () => {
  try {
    return await apiRequest('/api/admin/users');
  } catch (error) {
    console.warn('Get all users endpoint not available:', error.message);
    return { data: [] };
  }
};

// Public decorator endpoints
// GET /api/decorators/top - Get top decorators by rating (public endpoint, no auth required)
export const getTopDecorators = async () => {
  try {
    // Make a direct fetch call without authentication for public endpoint
    const response = await fetch(`${API_BASE_URL}/api/decorators/top`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching top decorators:', error);
    return { data: [] };
  }
};

