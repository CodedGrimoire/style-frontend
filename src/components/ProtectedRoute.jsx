import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../../firebase';
import Loading from './Loading';
import toast from 'react-hot-toast';

const ProtectedRoute = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
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
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
