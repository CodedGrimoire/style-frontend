import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthErrorBanner = () => {
  const { user, loading } = useAuth();
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    // Check if there's a Firebase auth configuration error
    const checkAuthError = () => {
      const errorMessages = [
        'CONFIGURATION_NOT_FOUND',
        'auth/configuration-not-found',
        'configuration-not-found'
      ];
      
      // Check console errors or localStorage for auth errors
      const hasError = errorMessages.some(msg => 
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
      <p><strong>The error "CONFIGURATION_NOT_FOUND" means Authentication is not enabled in your Firebase project.</strong></p>
      <ol>
        <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer">Firebase Console</a></li>
        <li>Select your project: <strong>style-decor-47d8f</strong></li>
        <li>Click <strong>Authentication</strong> in the left menu</li>
        <li>Click <strong>"Get started"</strong> if prompted</li>
        <li>Go to <strong>"Sign-in method"</strong> tab</li>
        <li>Enable <strong>Email/Password</strong> provider</li>
        <li>Enable <strong>Google</strong> provider (optional)</li>
        <li>Refresh this page after enabling</li>
      </ol>
      <p style={{ marginBottom: 0, fontSize: '0.9rem' }}>
        See <code>FIREBASE_SETUP.md</code> for detailed instructions.
      </p>
    </div>
  );
};

export default AuthErrorBanner;

