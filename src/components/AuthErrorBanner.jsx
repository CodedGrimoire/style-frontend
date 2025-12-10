import { useEffect, useState } from 'react';


import { useAuth } from '../context/AuthContext';

const AuthErrorBanner = () => 
  
  {
  const { user, loading } = useAuth();
  const [showError, setShowError] = useState(false);

  useEffect(() => 
    
    {
    
    const checkAuthError = () => 
      
      
      {
      const errorMessages = 
      
      [
        'CONFIGURATION_NOT_FOUND',
        'auth/configuration-not-found',
        'configuration-not-found'
      ];
      
      
      const hasError = errorMessages.some(() => 
        window.location.href.includes('error') || 
        localStorage.getItem('firebase_auth_error')
      );
      
      setShowError(hasError && !loading && !user);
    };

    checkAuthError();
    const interval = setInterval(checkAuthError, 2000);

    
    return () => clearInterval(interval);
  }, [loading, user]);

  if (!showError) return null;

  return (
    <div className="auth-error-banner">
      <h3>⚠️ Firebase Authentication Not Configured</h3>
   
      <p style={{ marginBottom: 0, fontSize: '0.9rem' }}>
        See <code>FIREBASE_SETUP.md</code> for detailed instructions.
      </p>
    </div>
  );
};

export default AuthErrorBanner;

