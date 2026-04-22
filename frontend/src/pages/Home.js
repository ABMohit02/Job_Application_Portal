import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalCompanies: 0,
    totalApplications: 0,
    totalJobSeekers: 0
  });

  useEffect(() => {
    const fetchPlatformStats = async () => {
      try {
        const res = await API.get('/api/jobs/platform/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching platform stats:', err);
      }
    };
    fetchPlatformStats();
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Find Your Dream Job</h1>
          <p>Discover thousands of job opportunities with all the information you need.</p>
          <div className="hero-buttons">
            <Link to="/jobs" className="btn btn-primary">
              Explore Jobs
            </Link>
            <Link to="/post-job" className="btn btn-secondary">
              Post a Job
            </Link>
          </div>
        </div>
      </section>

      {/* Live Stats Strip */}
      <section className="live-stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{stats.totalJobs.toLocaleString()}+</span>
              <span className="stat-label">Live Jobs</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.totalCompanies.toLocaleString()}+</span>
              <span className="stat-label">Companies</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.totalJobSeekers.toLocaleString()}+</span>
              <span className="stat-label">Job Seekers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.totalApplications.toLocaleString()}+</span>
              <span className="stat-label">Applications</span>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Why Choose JobPortal?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>Easy Application</h3>
              <p>Apply to multiple jobs with just a few clicks. Track your applications in one place.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Search & Filter</h3>
              <p>Find jobs by location, experience level, and job type with advanced filtering.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💼</div>
              <h3>Employer Tools</h3>
              <p>Post jobs and manage applications easily with our employer dashboard.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Analytics</h3>
              <p>Track your posting performance and see who is interested in your jobs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Create Account</h3>
              <p>Sign up as a job seeker or employer to get started with your journey.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Complete Profile</h3>
              <p>Fill in your details or company information to attract the best matches.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Apply or Post</h3>
              <p>Browse through thousands of jobs or post your requirements to find talent.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dual CTA Section */}
      <section className="dual-cta">
        <div className="container">
          <div className="dual-grid">
            <div className="cta-box seeker-box">
              <h2>Are you a Job Seeker?</h2>
              <p>Find the best opportunities from top companies around the world.</p>
              <Link to="/jobs" className="btn btn-white">Find Jobs</Link>
            </div>
            <div className="cta-box employer-box">
              <h2>Are you an Employer?</h2>
              <p>Post your job listings and find the perfect candidate today.</p>
              <Link to="/post-job" className="btn btn-white">Post Job</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="cta-content">
          <h2>Ready to Find Your Perfect Job?</h2>
          <p>Join thousands of job seekers who have found their dream roles.</p>
          <Link to="/jobs" className="btn btn-primary">
            Start Searching
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
