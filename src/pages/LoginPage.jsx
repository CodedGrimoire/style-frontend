import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Helper function to get dashboard route based on role
const getDashboardRoute = (userProfile) => {
  if (!userProfile) return '/dashboard';
  if (userProfile.role === 'admin') return '/admin';
  if (userProfile.role === 'decorator') return '/decorator';
  return '/dashboard';
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, userProfile, signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  // Redirect to correct dashboard when userProfile is loaded after login
  useEffect(() => {
    if (justLoggedIn && user && userProfile) {
      const dashboardRoute = getDashboardRoute(userProfile);
      navigate(dashboardRoute, { replace: true });
      setJustLoggedIn(false);
    }
  }, [user, userProfile, justLoggedIn, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      toast.success('Signed in successfully!');
      setJustLoggedIn(true);
      // Navigation will happen in useEffect when userProfile is loaded
    } catch (err) {
      // Error toast is already shown in AuthContext, no need to display error again
      // Silently catch to prevent console logging
      setJustLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogle();
      toast.success('Signed in with Google successfully!');
      setJustLoggedIn(true);
      // Navigation will happen in useEffect when userProfile is loaded
    } catch (err) {
      // Error toast is already shown in AuthContext, no need to display error again
      // Silently catch to prevent console logging
      setJustLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '80vh',
      padding: '2rem'
    }}>
      <div style={{ 
        maxWidth: '400px', 
        width: '100%',
        border: '1px solid #ccc',
        padding: '2rem',
        borderRadius: '8px'
      }}>
        <h1>Login</h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
            />
          </div>

          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '0.75rem', 
              marginTop: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <p>OR</p>
          <button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{ 
              padding: '0.75rem', 
              width: '100%',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Sign in with Google
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

