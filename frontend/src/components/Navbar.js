import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => setIsMenuOpen(false)}>
          JobPortal
        </Link>

        {/* Hamburger Icon */}
        <div className="navbar-hamburger" onClick={toggleMenu}>
          <span className={`bar ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${isMenuOpen ? 'open' : ''}`}></span>
        </div>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/jobs" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Browse Jobs
          </Link>
          <a href="/#how-it-works" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            How it Works
          </a>
          
          {user && user.role === 'employer' && (
            <>
              <Link to="/post-job" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                Post Job
              </Link>
              <Link to="/employer-dashboard" className="nav-link nav-link-highlight" onClick={() => setIsMenuOpen(false)}>
                📊 Employer Panel
              </Link>
            </>
          )}
          {user && user.role === 'user' && (
            <Link to="/my-applications" className="nav-link nav-link-highlight" onClick={() => setIsMenuOpen(false)}>
              My Applications
            </Link>
          )}
          
          <div className="navbar-auth-mobile">
            {user ? (
              <>
                <Link to="/dashboard" className="nav-link prof-link" onClick={() => setIsMenuOpen(false)}>
                  👤 {user.name}
                </Link>
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="nav-link register-btn" onClick={() => setIsMenuOpen(false)}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="navbar-auth-desktop">
          {user ? (
            <div className="user-nav-group">
              <Link to="/dashboard" className="nav-link profile-pill">
                <span className="pill-avatar">{user.name.charAt(0).toUpperCase()}</span>
                {user.name}
              </Link>
              <button className="logout-btn-minimal" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link register-btn">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
