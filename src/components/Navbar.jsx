import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DarkModeToggle from './DarkModeToggle';
import '../styles/navbar.css';

const Navbar = () => {
  const { user, userProfile, signOut } = useAuth();
  
  const location = useLocation();
  
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [showDropdown, setShowDropdown] = useState(false);


  const navigate = useNavigate();

  
  const getDashboardRoute = () => {
    if (!userProfile) return '/dashboard';

    if (userProfile.role === 'admin') return '/admin';
    if (userProfile.role === 'decorator') return '/decorator';
    return '/dashboard'; 
  };
  
  
  const isActive = (path) => 
    
    
    {
    if (path === '/') 
      
      {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  
  const isDashboardActive = () => 
    
    
    {
    return location.pathname === '/admin' || 
           location.pathname === '/decorator' || 
           location.pathname === '/dashboard';
  };

  const handleSignOut = async () => 
    
    
    {
    await signOut();
    navigate('/');
    setShowDropdown(false);
    setShowMobileMenu(false);
  };

  const handleDashboardClick = (e) => 
    
    {
    e.preventDefault();
    navigate(getDashboardRoute());
    setShowDropdown(false);
    setShowMobileMenu(false);
  };

  return (
    <nav className="navbar">
     
      <Link to="/" 
      
      
      className="navbar-brand">
        <img 
          src="/logo.jpeg" 


          alt="" 
          className="navbar-logo"
          onError={(e) => 
            
            {
            e.target.style.display = 'none';
          }}
        />
        <span className="navbar-brand-text">StyleDecor</span>
      </Link>

     
      <div className="navbar-menu">
        <Link to="/" className={`navbar-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
        <Link to="/services" className={`navbar-link ${isActive('/services') ? 'active' : ''}`}>Services</Link>
        <Link to="/about" className={`navbar-link ${isActive('/about') ? 'active' : ''}`}>About</Link>
        <Link to="/contact" className={`navbar-link ${isActive('/contact') ? 'active' : ''}`}>Contact</Link>
      </div>

     
      <div className="navbar-actions">
        <DarkModeToggle />
        {user ? (
          <>
            <button 
              onClick={handleDashboardClick}
              className={`navbar-dashboard-btn ${isDashboardActive() ? 'active' : ''}`}
            >
              Dashboard
            </button>
            <div className="navbar-dropdown">
              <button
                className="navbar-profile-btn"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span>{user.displayName || user.email?.split('@')[0] || 'Profile'}</span>
              
              </button>
              
              {showDropdown && (
                <>
                  <div
                    className="dropdown-overlay"
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="dropdown-menu">
                    <div className="dropdown-header">


                      <div className="dropdown-name">
                        
                        
                        {user.displayName || 'User'}
                        
                        
                        </div>
                      <div className="dropdown-email">{user.email}</div>
                      <div className="dropdown-role" style={{ 
                       
                        fontSize: '0.85rem', 

                        color: '#5a5a5aff',


                         marginTop: '0.5rem', 

                        fontWeight: 'bold'
                      }}>
                        Role: {userProfile?.role || 'Not loaded'}
                      </div>
                    </div>
                    <button
                      onClick={handleDashboardClick}


                      className="dropdown-item"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="dropdown-item dropdown-item-danger"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="navbar-dropdown">
            <button
              className="navbar-login-btn"


              onClick={() => setShowDropdown(!showDropdown)}
            >
              Login 
            </button>
            
            {showDropdown && (
              <>
                <div
                  className="dropdown-overlay"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="dropdown-menu">
                  <Link
                    to="/login"
                    onClick={() => setShowDropdown(false)}
                    className="dropdown-item"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setShowDropdown(false)}
                    className="dropdown-item"
                  >
                    Sign Up
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>

     
      <button
        className="navbar-mobile-toggle"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        aria-label="Toggle menu"
      >
        <span className={showMobileMenu ? 'hamburger active' : 'hamburger'}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

     
      {showMobileMenu && (
        <>
          <div
            className="mobile-menu-overlay"
            onClick={() => setShowMobileMenu(false)}
          />
          <div className="mobile-menu">
            <Link
              to="/"
              className={`mobile-menu-link ${isActive('/') ? 'active' : ''}`}
              onClick={() => setShowMobileMenu(false)}
            >
              Home
            </Link>
            <Link
              to="/services"
              className={`mobile-menu-link ${isActive('/services') ? 'active' : ''}`}
              onClick={() => setShowMobileMenu(false)}
            >
              Services
            </Link>
            <Link
              to="/about"
              className={`mobile-menu-link ${isActive('/about') ? 'active' : ''}`}
              onClick={() => setShowMobileMenu(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`mobile-menu-link ${isActive('/contact') ? 'active' : ''}`}
              onClick={() => setShowMobileMenu(false)}
            >
              Contact
            </Link>
            {user ? (
              <>
                <button
                  onClick={handleDashboardClick}
                  className={`mobile-menu-link ${isDashboardActive() ? 'active' : ''}`}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    width: '100%', 
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  Dashboard
                </button>
                <div className="mobile-menu-user">
                  <div className="mobile-menu-user-info">
                    <div className="mobile-menu-user-name">
                      {user.displayName || 'User'}
                    </div>
                    <div className="mobile-menu-user-email">{user.email}</div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="mobile-menu-signout"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="mobile-menu-link"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="mobile-menu-link mobile-menu-link-primary"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
            <div style={{ padding: '1rem 2rem', borderTop: '1px solid var(--border-color)' }}>
              <DarkModeToggle />
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
