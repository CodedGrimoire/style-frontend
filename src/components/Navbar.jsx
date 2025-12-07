import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/navbar.css';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setShowDropdown(false);
    setShowMobileMenu(false);
  };

  return (
    <nav className="navbar">
      {/* Logo & Brand Name */}
      <Link to="/" className="navbar-brand">
        <img 
          src="/logo.jpeg" 
          alt="StyleDecor Logo" 
          className="navbar-logo"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <span className="navbar-brand-text">StyleDecor</span>
      </Link>

      {/* Desktop Navigation Menu */}
      <div className="navbar-menu">
        <Link to="/" className="navbar-link">Home</Link>
        <Link to="/services" className="navbar-link">Services</Link>
        <Link to="/about" className="navbar-link">About</Link>
        <Link to="/contact" className="navbar-link">Contact</Link>
      </div>

      {/* Desktop Dashboard & Profile */}
      <div className="navbar-actions">
        {user ? (
          <>
            <Link to="/dashboard" className="navbar-dashboard-btn">
              Dashboard
            </Link>
            <div className="navbar-dropdown">
              <button
                className="navbar-profile-btn"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span>{user.displayName || user.email?.split('@')[0] || 'Profile'}</span>
                <span className="dropdown-arrow">▼</span>
              </button>
              
              {showDropdown && (
                <>
                  <div
                    className="dropdown-overlay"
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <div className="dropdown-name">{user.displayName || 'User'}</div>
                      <div className="dropdown-email">{user.email}</div>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setShowDropdown(false)}
                      className="dropdown-item"
                    >
                      My Dashboard
                    </Link>
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
              Login <span className="dropdown-arrow">▼</span>
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

      {/* Mobile Menu Button */}
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

      {/* Mobile Menu */}
      {showMobileMenu && (
        <>
          <div
            className="mobile-menu-overlay"
            onClick={() => setShowMobileMenu(false)}
          />
          <div className="mobile-menu">
            <Link
              to="/"
              className="mobile-menu-link"
              onClick={() => setShowMobileMenu(false)}
            >
              Home
            </Link>
            <Link
              to="/services"
              className="mobile-menu-link"
              onClick={() => setShowMobileMenu(false)}
            >
              Services
            </Link>
            <Link
              to="/about"
              className="mobile-menu-link"
              onClick={() => setShowMobileMenu(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="mobile-menu-link"
              onClick={() => setShowMobileMenu(false)}
            >
              Contact
            </Link>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="mobile-menu-link"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Dashboard
                </Link>
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
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
