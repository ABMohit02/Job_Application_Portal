import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="notfound-page">
      <div className="notfound-container">
        <div className="notfound-code">404</div>
        <div className="notfound-icon">🔍</div>
        <h1>Page Not Found</h1>
        <p>
          Oops! The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>
        <div className="notfound-actions">
          <Link to="/" className="notfound-btn-primary">← Back to Home</Link>
          <Link to="/jobs" className="notfound-btn-secondary">Browse Jobs</Link>
        </div>
        <div className="notfound-suggestions">
          <p>Popular pages:</p>
          <div className="notfound-links">
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/jobs">Jobs</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
