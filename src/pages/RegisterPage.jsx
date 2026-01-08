import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/pages.css';

const getDashboardRoute = (userProfile) => {
  if (!userProfile) return '/dashboard';
  if (userProfile.role === 'admin') return '/admin';
  if (userProfile.role === 'decorator') return '/decorator';
  return '/dashboard';
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { user, userProfile, signUp, signInWithGoogle, signIn } = useAuth();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get demo credentials from environment variables
  const demoEmail = import.meta.env.VITE_DEMO_USER_EMAIL || 'demo@styledecor.com';
  const demoPassword = import.meta.env.VITE_DEMO_USER_PASSWORD || 'demo123';

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

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!name || name.trim().length === 0) {
      toast.error('Name is required');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, name || null);
      toast.success('Account created successfully!');
      setJustLoggedIn(true);
    } catch (err) {
      setJustLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    setEmail(demoEmail);
    setPassword(demoPassword);

    try {
      // Try to sign up first
      await signUp(demoEmail, demoPassword, 'Demo User');
      toast.success('Demo account created and logged in!');
      setJustLoggedIn(true);
    } catch (err) {
      // If account exists, try to sign in
      try {
        await signIn(demoEmail, demoPassword);
        toast.success('Demo login successful!');
        setJustLoggedIn(true);
      } catch (loginErr) {
        toast.error('Demo login failed. Please check your credentials.');
        setJustLoggedIn(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogle();
      toast.success('Signed up with Google successfully!');
      setJustLoggedIn(true);
    } catch (err) {
      setJustLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="container">
        <div className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ maxWidth: '450px', width: '100%' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              Sign Up
            </h1>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Name (required)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="form-input"
                    placeholder="Enter your password"
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-tertiary)',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="form-input"
                    placeholder="Confirm your password"
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-tertiary)',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ 
                  padding: '0.75rem', 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  color: '#ef4444',
                  fontSize: '0.9rem'
                }}>
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', padding: '0.875rem' }}
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <button
                onClick={handleDemoLogin}
                disabled={loading}
                className="btn-secondary"
                style={{ width: '100%', padding: '0.875rem', marginBottom: '1rem' }}
              >
                {loading ? 'Loading...' : 'Try Demo Account'}
              </button>
              <p style={{ color: 'var(--text-tertiary)', margin: '1rem 0' }}>OR</p>
              <button 
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="btn-outline"
                style={{ width: '100%', padding: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign up with Google
              </button>
            </div>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
