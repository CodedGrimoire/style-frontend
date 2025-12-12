import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import { useAuth } from '../context/AuthContext';


 import { useNavigate, Link } from 'react-router-dom';



const getDashboardRoute = (userProfile) => {
  if (!userProfile) 
    
    return '/dashboard';


  if (userProfile.role === 'admin')
    
    return '/admin';


  if (userProfile.role === 'decorator')
    
    return '/decorator';
  return '/dashboard';
};

const LoginPage = () => 
  
  {
  const navigate = useNavigate();
 
  
  const [loading, setLoading] = useState(false);

  const [password, setPassword] = useState('');
   const [showPassword, setShowPassword] = useState(false);

    const { user, userProfile, signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const [justLoggedIn, setJustLoggedIn] = useState(false);

 
  useEffect(() => 
    
    {
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
    setLoading(true);

    try 
    
    {
      await signIn(email, password);
      toast.success('Signed in successfully!');
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
     
      setJustLoggedIn(true);

        toast.success('Signed in with Google successfully!');
     
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

  return (
    <div style={
      
      
      { 
    
     
      alignItems: 'center', 
      minHeight: '80vh',


       justifyContent: 'center', 

         display: 'flex', 
      padding: '2rem'
    }
    
    }>
      <div style={{ 
        maxWidth: '400px', 
       
        padding: '2rem',

         width: '100%',
        border: ' #d9d7d7ff 1px solid',

        borderRadius: '8px'
      }}>
        <h1>
          
          Login
          
          
          </h1>

        <form 
        
        
        onSubmit={handleSubmit} 
        
        
        style={{ display: 'flex',
        
        
        flexDirection: 'column', 
        
        
        gap: '1rem' }
        
        }>
          <div>
            <label>
              
              Email:</label>
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
            <div 
            
            
            style={
              
              
              
              { position: 'relative', 
              
              
              width: '100%' }
              
              
              }>
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
                 
                  background: 'none',

                   display: 'flex',
                  border: 'none',
                
                  padding: '0.25rem',

                   right: '10px',

                      alignItems: 'center',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#666',
                 
               
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

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '0.75rem', 

               color: 'black',
                background:'rgba(236, 240, 200, 1)',
              marginTop: '1rem',
              
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div
        
        
        style={{ marginTop: '1rem', 
        
        
        textAlign: 'center' }}>
          <p>
            
            
            OR
            </p>
          <button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{ 
              padding: '0.75rem', 

               color: 'black',
               background:'rgba(236, 240, 200, 1)',
              width: '100%',
              
            }}
          >
            Sign in with Google
          </button>
        </div>

        <p 
        
        
        style={
          
          
          { textAlign: 'center',
          
          
          marginTop: '1rem' }}>
          Don't have an account?
          
          
           <Link to="/register">
           
           Sign Up
           
           </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

