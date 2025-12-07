import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setShowDropdown(false);
  };

  return (
    <nav style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      width: '100%',
      padding: '0.75rem 2rem', 
      borderBottom: '1px solid #ccc',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#fff',
      zIndex: 1000,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {/* Logo & Brand Name */}
      <Link 
        to="/" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          textDecoration: 'none',
          color: 'inherit'
        }}
      >
        <img 
          src="/logo.jpeg" 
          alt="StyleDecor Logo" 
          style={{ 
            height: '40px', 
            width: 'auto' 
          }}
          onError={(e) => {
            // Fallback if logo doesn't exist
            e.target.style.display = 'none';
          }}
        />
        <span style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold',
          color: '#333'
        }}>
          StyleDecor
        </span>
      </Link>

      {/* Navigation Menu */}
      <div style={{ 
        display: 'flex', 
        gap: '2rem',
        alignItems: 'center'
      }}>
        <Link 
          to="/" 
          style={{ 
            textDecoration: 'none', 
            color: '#333',
            fontWeight: '500',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.color = '#007bff'}
          onMouseLeave={(e) => e.target.style.color = '#333'}
        >
          Home
        </Link>
        <Link 
          to="/services" 
          style={{ 
            textDecoration: 'none', 
            color: '#333',
            fontWeight: '500',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.color = '#007bff'}
          onMouseLeave={(e) => e.target.style.color = '#333'}
        >
          Services
        </Link>
        <Link 
          to="/about" 
          style={{ 
            textDecoration: 'none', 
            color: '#333',
            fontWeight: '500',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.color = '#007bff'}
          onMouseLeave={(e) => e.target.style.color = '#333'}
        >
          About
        </Link>
        <Link 
          to="/contact" 
          style={{ 
            textDecoration: 'none', 
            color: '#333',
            fontWeight: '500',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.color = '#007bff'}
          onMouseLeave={(e) => e.target.style.color = '#333'}
        >
          Contact
        </Link>
      </div>

      {/* Dashboard & Profile Dropdown */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: '1rem',
        position: 'relative'
      }}>
        {user ? (
          <>
            <Link 
              to="/dashboard" 
              style={{ 
                textDecoration: 'none', 
                color: '#333',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              Dashboard
            </Link>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                <span>{user.displayName || user.email?.split('@')[0] || 'Profile'}</span>
                <span>▼</span>
              </button>
              
              {showDropdown && (
                <>
                  <div
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 999
                    }}
                    onClick={() => setShowDropdown(false)}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    backgroundColor: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    minWidth: '200px',
                    zIndex: 1000
                  }}>
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #eee' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                        {user.displayName || 'User'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                        {user.email}
                      </div>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setShowDropdown(false)}
                      style={{
                        display: 'block',
                        padding: '0.75rem 1rem',
                        textDecoration: 'none',
                        color: '#333',
                        borderBottom: '1px solid #eee',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      My Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: 'none',
                        backgroundColor: 'transparent',
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: '#d32f2f',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#ffe6e6'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: '#fff',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Login <span>▼</span>
            </button>
            
            {showDropdown && (
              <>
                <div
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 999
                  }}
                  onClick={() => setShowDropdown(false)}
                />
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  minWidth: '150px',
                  zIndex: 1000
                }}>
                  <Link
                    to="/login"
                    onClick={() => setShowDropdown(false)}
                    style={{
                      display: 'block',
                      padding: '0.75rem 1rem',
                      textDecoration: 'none',
                      color: '#333',
                      borderBottom: '1px solid #eee',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setShowDropdown(false)}
                    style={{
                      display: 'block',
                      padding: '0.75rem 1rem',
                      textDecoration: 'none',
                      color: '#333',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    Sign Up
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

