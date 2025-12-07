import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../../firebase';
import Loading from './Loading';
import toast from 'react-hot-toast';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const location = useLocation();
  const [tokenValid, setTokenValid] = useState(false);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (!user) {
        setVerifying(false);
        return;
      }

      try {
        // Get the current token
        const token = await user.getIdToken();
        
        // Verify token is not expired (Firebase handles this, but we can check)
        if (token) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          toast.error('Session expired. Please log in again.');
        }
      } catch (error) {
        console.error('Token verification error:', error);
        setTokenValid(false);
        toast.error('Authentication error. Please log in again.');
      } finally {
        setVerifying(false);
      }
    };

    if (!authLoading) {
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

  // Role-based access control
  if (requiredRole && userProfile) {
    const userRole = userProfile.role || 'user';
    
    // Check if user has the required role
    if (requiredRole === 'admin' && userRole !== 'admin') {
      toast.error('Access denied. This page requires admin privileges.');
      return <Navigate to="/dashboard" replace />;
    }
    
    if (requiredRole === 'decorator' && userRole !== 'decorator' && userRole !== 'admin') {
      toast.error('Access denied. This page requires decorator privileges.');
      return <Navigate to="/dashboard" replace />;
    }
    
    // For user routes, allow all authenticated users
    if (requiredRole === 'user' && !['user', 'admin', 'decorator'].includes(userRole)) {
      toast.error('Access denied. Please complete your profile registration.');
      return <Navigate to="/dashboard" replace />;
    }
  }

  // If role is required but profile is not loaded yet, wait
  if (requiredRole && !userProfile && !authLoading) {
    // Profile might still be loading, show loading state
    return <Loading />;
  }

  return children;
};

export default ProtectedRoute;
