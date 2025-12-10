import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import toast from 'react-hot-toast';


 import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

const ProtectedRoute = ({ children, requiredRole = null }) => 
  
  {
  const { user, userProfile, loading: authLoading } = useAuth();
  const location = useLocation();
  
  const [verifying, setVerifying] = useState(true);


   const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!user) {
        setVerifying(false);
        return;
      }

      try
      
      
      {
       
        const token = await user.getIdToken();
        
       
        if (token) {
          setTokenValid(true);
        } 
        
        
        else 
          
          {
          setTokenValid(false);
          toast.error('Session expired. Please log in again.');
        }
      } 
      
      
      catch (error)
      
      
      {
        console.error('Token verification error:', error);
        setTokenValid(false);
        toast.error('Authentication error. Please log in again.');
      } 
      
      
      finally
      
      
      {
        setVerifying(false);
      }
    };

    if (!authLoading)
      
      
      {
      verifyToken();
    }
  }, [user, authLoading]);

  if (authLoading || verifying) {
    return <Loading />;
  }

  if (!user || !tokenValid) {
    toast.error('You need to log in to access this page.');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  
  if (requiredRole && userProfile)
    
    
    {
    const userRole = userProfile.role || 'user';
    
    
    if (requiredRole === 'admin' && userRole !== 'admin') 
      
      
      {
      toast.error('Access denied. This page requires admin privileges.');
      return <Navigate to="/dashboard" replace />;
    }
    
    if (requiredRole === 'decorator' && userRole !== 'decorator' && userRole !== 'admin') 
      
      
      {
      toast.error('Access denied. This page requires decorator privileges.');


      return <Navigate to="/dashboard" replace />;
    }
    
    
    if (requiredRole === 'user' && !['user', 'admin', 'decorator'].includes(userRole)) 
      
      {
      toast.error('Access denied. Please complete your profile registration.');
      return <Navigate to="/dashboard" replace />;
    }
  }


  if (requiredRole && !userProfile && !authLoading)
    
    
    {
    
    return <Loading />;
  }

  return children;
};

export default ProtectedRoute;
