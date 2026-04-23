import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { API, AuthContext } from '../context/AuthContext';
import { formatSalaryWithConversion } from '../utils/currencyHelper';
import './Jobs.css';

const Jobs = () => {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [isHired, setIsHired] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    jobType: '',
    experience: '',
    salaryMin: '',
    skills: '',
    company: '',
    sort: 'latest',
  });
  const [page, setPage] = useState(1);

  const checkHireStatus = useCallback(async () => {
    try {
      const res = await API.get('/api/applications/user/my-applications');
      const hired = res.data.some(a => a.status === 'hired');
      setIsHired(hired);
    } catch (err) {
      console.error("Error checking hire status:", err);
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...filters,
        skip: (page - 1) * 10,
        limit: 10,
      });

      const response = await API.get(`/api/jobs?${params}`);
      setJobs(response.data.jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchJobs();
    if (user && user.role === 'user') {
      checkHireStatus();
    }
  }, [fetchJobs, checkHireStatus, user]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(page); // Stay on current page or reset? Usually reset to 1
    if (name !== 'page') setPage(1);
  };

  const handleQuickApply = async (jobId) => {
    if (!user) {
      alert('Please log in to apply.');
      return;
    }

    if (isHired) {
      alert('You are currently hired for a position. You must resign before you can apply for other jobs.');
      return;
    }
    
    setApplyingId(jobId);
    try {
      // One-tap apply uses empty body, backend uses profile resume
      const res = await API.post(`/api/applications/${jobId}`, {});
      alert(res.data.message || 'Application submitted successfully!');
      
      // Update local state to show 'Applied'
      setJobs(prev => prev.map(j => j._id === jobId ? { ...j, hasApplied: true } : j));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="jobs-container">
      <div className="jobs-header">
        <h1>Find Jobs</h1>
      </div>

      <div className="jobs-content">
        <aside className="filters">
          <h3>Filters</h3>
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              name="search"
              placeholder="Job title, skill..."
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              placeholder="City or Country"
              value={filters.location}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label>Job Type</label>
            <select name="jobType" value={filters.jobType} onChange={handleFilterChange}>
              <option value="">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Experience</label>
            <input
              type="text"
              name="experience"
              placeholder="e.g., 2 years"
              value={filters.experience}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label>Min Salary</label>
            <input
              type="number"
              name="salaryMin"
              placeholder="Min Salary"
              value={filters.salaryMin}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label>Specific Skill</label>
            <input
              type="text"
              name="skills"
              placeholder="e.g., React"
              value={filters.skills}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label>Company</label>
            <input
              type="text"
              name="company"
              placeholder="Company Name"
              value={filters.company}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label>Sort By</label>
            <select name="sort" value={filters.sort} onChange={handleFilterChange}>
              <option value="latest">Latest</option>
              <option value="salaryDesc">Salary (High to Low)</option>
              <option value="salaryAsc">Salary (Low to High)</option>
            </select>
          </div>
        </aside>

        <main className="jobs-list">
          {loading ? (
            <div className="loading">Loading jobs...</div>
          ) : jobs.length > 0 ? (
            jobs.map((job) => (
              <div key={job._id} className="job-card">
                <div className="job-header">
                  <h3>{job.title}</h3>
                  <span className="job-type">{job.jobType}</span>
                </div>
                <p className="company">{job.company}</p>
                <p className="location">📍 {job.location}</p>
                <p className="description">{job.description.substring(0, 150)}...</p>
                {job.salary && (
                  <p className="salary">
                    💰 {formatSalaryWithConversion(job.salary)}
                  </p>
                )}
                <div className="skills">
                  {job.skills &&
                    job.skills.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                </div>
                <div className="job-card-actions">
                  <Link to={`/job/${job._id}`} className="btn btn-secondary">
                    View Details
                  </Link>

                  {user?.role === 'user' && (
                    <>
                      {job.hasApplied ? (
                        <span className="applied-badge">Applied ✅</span>
                      ) : isHired ? (
                        <span className="hired-restricted-badge">Hire Active 🔒</span>
                      ) : (
                        <button 
                          className="btn btn-primary quick-apply-btn"
                          disabled={applyingId === job._id || !user.resume}
                          onClick={() => handleQuickApply(job._id)}
                        >
                          {applyingId === job._id ? 'Applying...' : user.resume ? '⚡ Quick Apply' : 'Add Resume to Apply'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-jobs">No jobs found. Try adjusting your filters.</div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Jobs;
