import { auth } from '../../firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://styledecor-backend.vercel.app';


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
    headers: 
    
    {
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
          
         
          const token = await currentUser.getIdToken(true);

          
          if (!token) 
            
            
            {
            throw new Error('Failed to get authentication token');
          }
          
        
          let userName = currentUser.displayName;
          if (!userName || userName.trim().length === 0) 
            
            
            {
            userName = currentUser.email?.split('@')[0];
          }
        
          if (!userName || userName.trim().length === 0) 
            
            
            {
            userName = currentUser.email?.split('@')[0] || 'User';
          }
          userName = userName.trim();
          
          console.log('Registering with name:', userName);
          
          
          const regResponse = await fetch(`${API_BASE_URL}/api/register`,
            
            
            {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(
              
              
              {
              name: userName,
              role: 'user',
              image: currentUser.photoURL || null,
            }
          
          ),
          });
          
          console.log('Registration response status:', regResponse.status);
          
          if (regResponse.ok)
            
            {
            const regData = await regResponse.json();
            console.log('Automatic registration successful:', regData);
           
            return apiRequest(endpoint, options, retryCount + 1);
          }
          
          
          else 
            
            
            {
            const regErrorText = await regResponse.text();
            let regError;
            try 
            
            
            {
              regError = JSON.parse(regErrorText);
            } 
            
            
            catch
            
            
            {
              regError = { message: regErrorText || 'Registration failed' };
            }
          
            if (regError.message && regError.message.includes('already registered')) 
              
              
              {
              
              
             
              await currentUser.getIdToken(true);
              
             
              await new Promise(resolve => setTimeout(resolve, 500));
              
             
              return apiRequest(endpoint, options, retryCount + 1);
            }
            
            throw new Error('USER_PROFILE_REQUIRED: ' + errorMessage + '. Registration failed: ' + (regError.message || 'Unknown error'));
          }
        }
        
        catch (regError) 
        
        {
         
          console.error('Error details:', 
            
            
            {
            message: regError.message,
            stack: regError.stack,
            name: regError.name
          });
          throw new Error('USER_PROFILE_REQUIRED: ' + errorMessage + '. Please complete your profile registration. Error: ' + regError.message);
        }
      } 
      
      
      else
        
        
        {
        throw new Error('USER_PROFILE_REQUIRED: ' + errorMessage);
      }
    }
    
   
    if (response.status === 401) 
      
      
      {
      throw new Error('Authentication failed. Please log in again.');
    }
    
   
    if (response.status >= 500) 
      
      
      {
      throw new Error(`Server error (${response.status}): ${errorMessage}. Please check the backend logs.`);
    }
    
    throw new Error(errorMessage);
  }

  
  const text = await response.text();
  if (!text || text.trim().length === 0)
    
    
    {
    return { success: true };
  }
  try
  
  
  {
    return JSON.parse(text);
  }
  
  
  catch (parseError) 
  
  
  {
    console.error('Failed to parse response as JSON:', parseError);
    console.error('Response text:', text);
    throw new Error('Invalid response format from server');
  }
};


export const getServices = async (category = null) => 
  
  
  {
  try 
  
  
  {
    const query = category ? `?category=${category}` : '';
   
    const response = await fetch(`${API_BASE_URL}/api/services${query}`,
      
      
      {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok)
      
      {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  }
  
  catch (error) 
  
  
  {
    console.error('Error fetching services:', error);
    throw error;
  }
};

export const getServiceById = async (id) => 
  
  
  {
  try
  
  
  {
   
    const response = await fetch(`${API_BASE_URL}/api/services/${id}`, 
      
      
      {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  
  );

    if (!response.ok) 
      
      
      {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } 
  
  
  catch (error) {
    console.error('Error fetching service:', error);
    throw error;
  }
};


export const registerUser = async (name, role = 'user', image = null) => 
  
  
  {
  try 
  
  
  {
    if (!name || name.trim().length === 0)
      
      
      {
      throw new Error('Name is required.');
    }

    const user = auth.currentUser;
    if (!user)
      
      
      {
      throw new Error('No authenticated user found. Please log in first.');
    }

    
    const token = await user.getIdToken(true);


    if (!token)
      
      
      {
      throw new Error('Failed to get authentication token');
    }

    console.log('Registering user with:', { name: name.trim(), role, email: user.email });

    
    const response = await fetch(`${API_BASE_URL}/api/register`, 
      
      
      {
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

    if (!response.ok) 
      
      
      {
      const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
      const errorMessage = errorData.message || 'Registration failed';
      console.error('Registration failed:', errorMessage, 'Status:', response.status);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    
    return data.data || data;
  } 
  
  
  catch (error)
  
  
  {
    
    console.error('User registration error:', error);
    throw error;
  }
};


export const getCurrentUser = async () =>
  
  
  {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    
    
    const response = await apiRequest('/api/users/me');
  
    return response.data || response;
  } 
  
  
  catch (error)
  
  
  {
    
    console.warn('Failed to get current user profile:', error.message);
    return null;
  }
};

export const createBooking = (bookingData) =>
  
  
  {
  return apiRequest('/api/bookings',
    
    
    {
    method: 'POST',
    body: bookingData,
  });
};

export const getMyBookings = () =>
  
  
  {
  return apiRequest('/api/bookings/me');
};

export const cancelBooking = (id) => 
  
  
  {
  return apiRequest(`/api/bookings/${id}`, {
    method: 'DELETE',
  });
};


export const createPaymentIntent = (bookingId) => 
  
  
  {
  return apiRequest('/api/payments/create-intent',
    
    
    {
    method: 'POST',
    body: { bookingId },
  });
};

export const confirmPayment = (paymentId) => 
  
  
  {
  return apiRequest('/api/payments/confirm',
    
    {
    method: 'POST',
    body: { paymentId },
  });
};


export const getDecoratorProjects = () => 
  
  
  {
  return apiRequest('/api/decorator/projects');
};

export const updateProjectStatus = (bookingId, status) => 
  
  
  {
  return apiRequest(`/api/decorator/project/${bookingId}/status`,
    
    
    {
    method: 'PUT',
    body: { status },
  });
};


export const createService = (serviceData) => 
  
  
  {
  return apiRequest('/api/admin/services', {
    method: 'POST',
    body: serviceData,
  });
};



export const updateService = (id, serviceData) => 
  
  
  {
  return apiRequest(`/api/admin/services/${id}`, 
    
    
    {
    method: 'PUT',
    body: serviceData,
  });
};

export const deleteService = (id) => 
  
  
  {
  return apiRequest(`/api/admin/services/${id}`, 
    
    
    {
    method: 'DELETE',
  });
};

export const getAllBookings = (filters = {}) => 
  
  
  {
  const queryParams = new URLSearchParams();
  if (filters.status) queryParams.append('status', filters.status);

  if (filters.paymentStatus) queryParams.append('paymentStatus', filters.paymentStatus);
  const query = queryParams.toString();
  return apiRequest(`/api/admin/bookings${query ? `?${query}` : ''}`);
};

export const assignDecorator = (bookingId, decoratorId) =>
  
  
  {
  return apiRequest(`/api/admin/bookings/${bookingId}/assign`,
    
    
    
    {
    method: 'PUT',
    body: { decoratorId },
  });
};

export const makeUserDecorator = (userId, specialties) => 
  
  
  {
 
  const specialtiesArray = Array.isArray(specialties) ? specialties : [specialties].filter(Boolean);
  
  console.log('makeUserDecorator called with:', { userId, specialties, specialtiesArray });
  
  if (!userId)
    
    
    {
    throw new Error('User ID is required');
  }
  
  if (!specialtiesArray || specialtiesArray.length === 0) 
    
    
    {
    throw new Error('At least one specialty is required');
  }
  
  return apiRequest(`/api/admin/users/${userId}/make-decorator`, 
    
    
    
    {
    method: 'PUT',
    body: { specialties: specialtiesArray },
  });
};

export const approveDecorator = (decoratorId) => {
  return apiRequest(`/api/admin/decorators/${decoratorId}/approve`, 
    
    
    {
    method: 'PUT',
  });
};

export const disableDecorator = (decoratorId) => 
  
  
  {
  return apiRequest(`/api/admin/decorators/${decoratorId}/disable`, 
    
    
    {
    method: 'PUT',
  });
};

export const getRevenueAnalytics = (startDate = null, endDate = null) => 
  
  
  {
  const queryParams = new URLSearchParams();
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  const query = queryParams.toString();
  return apiRequest(`/api/admin/analytics/revenue${query ? `?${query}` : ''}`);
};

export const getServiceDemandAnalytics = () =>
  
  
  {
  return apiRequest('/api/admin/analytics/service-demand');
};


export const getAllDecorators = async () => 
  
  
  {
  try 
  
  
  {
    return await apiRequest('/api/admin/decorators');
  }
  
  
  catch (error) 
  
  
  {
    console.warn('Get all decorators endpoint not available:', error.message);
    return { data: [] };
  }
};


export const getAllUsers = async () => 
  
  
  {
  try 
  
  {
    return await apiRequest('/api/admin/users');
  } 
  
  
  catch (error) 
  
  
  {
    console.warn('Get all users endpoint not available:', error.message);
    return { data: [] };
  }
};


export const getTopDecorators = async () => 
  
  
  {
  try 
  
  {
   
    const response = await fetch(`${API_BASE_URL}/api/decorators/top`, 
      
      
      {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) 
      
      
      {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  }
  
  
  catch (error) 
  
  
  
  {
    console.error('Error fetching top decorators:', error);
    return { data: [] };
  }
};

