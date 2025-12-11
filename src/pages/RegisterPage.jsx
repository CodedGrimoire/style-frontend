import { useState, useEffect } from 'react';

 import toast from 'react-hot-toast';

import { useNavigate, Link } from 'react-router-dom';


import { useAuth } from '../context/AuthContext';


const getDashboardRoute = (userProfile) =>
  
  
  {
  if (!userProfile) 
    
    
    return '/dashboard';
  if (userProfile.role === 'admin') 
    
    
    return '/admin';
  if (userProfile.role === 'decorator') 
    
    return '/decorator';
  return '/dashboard';
};

const RegisterPage = () => 
  
  {
  const navigate = useNavigate();
  const { user, userProfile, signUp, signInWithGoogle } = useAuth();

 
  const [name, setName] = useState('');
  const [error, setError] = useState('');


    const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [justLoggedIn, setJustLoggedIn] = useState(false);


  const [showPassword, setShowPassword] = useState(false);


   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

 
  useEffect(() => {
    if (justLoggedIn && user && userProfile) 
      
      
      {
      const dashboardRoute = getDashboardRoute(userProfile);

      navigate(dashboardRoute, { replace: true });
      setJustLoggedIn(false);
    }
  }, [user, userProfile, justLoggedIn, navigate]);

  const handleSubmit = async (e) => 
    
    
    {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) 
      
      
      {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) 
      
      {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!name || name.trim().length === 0) 
      
      {
      toast.error('Name is required');
      return;
    }

    setLoading(true);

    try 
    
    {
      await signUp(email, password, name || null);
      toast.success('Account created successfully!');
      setJustLoggedIn(true);
      
    } 
    
    
    catch (err) 
    
    {
    
      setJustLoggedIn(false);
    } 
    
    finally 
    
    
    {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => 
    
    
    {
    setError('');
    setLoading(true);

    try 
    {
      await signInWithGoogle();
      toast.success('Signed up with Google successfully!');
      setJustLoggedIn(true);
     
    } 
    
    catch (err) 
    
    {
      // Error toast is already shown in AuthContext, no need to display error again
      // Silently catch to prevent console logging
      setJustLoggedIn(false);
    } 
    
    finally 
    
    {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
    
      minHeight: '80vh',


        justifyContent: 'center', 
      alignItems: 'center', 
      padding: '2rem'
    }}>
      <div style={{ 
      
        padding: '2rem',

          maxWidth: '400px', 
        width: '100%',
        border: ' solid #ccc 1px',
        borderRadius: '8px'
      }}>
        <h1>
          
          
          Sign Up
          
          </h1>

        <form 
        
        
        onSubmit={handleSubmit} 
        
        
        style={
          
          
          { display: 'flex', 
          
          
          flexDirection: 'column', 
          
          
          gap: '1rem' }}>
          <div>
            <label>
              
              
              Name (required):
              
              </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
              style={
                
                
                
                { width: '100%', 
                  
                  
                  padding: '0.5rem',
                  
                  marginTop: '0.5rem' }}
            />
          </div>

          <div>
            <label>
              
              
              Email:
              </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={
                
                { width: '100%', 
                  
                  
                  padding: '0.5rem',
                  
                  marginTop: '0.5rem' }}
            />
          </div>

          <div>
            <label>
              
              Password:
              
              
              </label>
            <div style={
              
              
              
              { position: 'relative',
              
              
              
              width: '100%' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={
                  
                  
                  
                  { width: '100%',
                    
                    
                    padding: '0.5rem',
                    
                    
                    
                    paddingRight: '2.5rem',
                    
                    
                    marginTop: '0.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',

                   color: '#676363ff',


                   alignItems: 'center',
                  display: 'flex',
                  top: '50%',
                 
                  background: 'none',
                  border: 'none',
                
                  padding: '0.25rem',
                  transform: 'translateY(-50%)',
                  
                  justifyContent: 'center'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <i 
                
                
                className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}>



                </i>
              </button>
            </div>
          </div>

          <div>
            <label>
              
              
              
              Confirm Password:
              
              
              </label>
            <div 
            
            
            
            style={
              { position: 'relative', 
              
              
              
              width: '100%' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={
                  
                  
                  
                  { width: '100%',
                    
                    padding: '0.5rem', 
                    
                    
                    paddingRight: '2.5rem',
                    
                    
                    marginTop: '0.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',

                    padding: '0.25rem',
                  color: '#666666ff',
                  display: 'flex',
                 
                  top: '50%',
                
                  background: 'none',

                    transform: 'translateY(-50%)',

                     alignItems: 'center',
                  border: 'none',
                 
                
                  justifyContent: 'center'
                }}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                <i 
                
                className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}>



                </i>
              </button>
            </div>
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
            {loading ? 'Creating account...' : 'Sign Up'}


          </button>
        </form>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <p>
            
            OR
            
            </p>
          <button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{ 
              padding: '0.75rem', 


              width: '100%',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Sign up with Google
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Already have an account? 
          
          
          <Link to="/login">
          
          
          Login
          
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

