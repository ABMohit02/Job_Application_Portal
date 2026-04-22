import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, API } from '../context/AuthContext';
import { currencies } from '../utils/currencyHelper';
import './PostJob.css';

const PostJob = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    salary: { min: '', max: '', currency: 'INR' },
    jobType: 'Full-time',
    experience: '',
    skills: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'salaryMin') {
      setFormData((prev) => ({
        ...prev,
        salary: { ...prev.salary, min: value },
      }));
    } else if (name === 'salaryMax') {
      setFormData((prev) => ({
        ...prev,
        salary: { ...prev.salary, max: value },
      }));
    } else if (name === 'currency') {
      setFormData((prev) => ({
        ...prev,
        salary: { ...prev.salary, currency: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const jobData = {
        ...formData,
        skills: formData.skills.split(',').map((s) => s.trim()),
        salary: {
          min: parseInt(formData.salary.min) || 0,
          max: parseInt(formData.salary.max) || 0,
          currency: formData.salary.currency || 'USD',
        },
      };

      await API.post('/api/jobs', jobData);
      navigate('/jobs');
    } catch (err) {
      setError(err.response?.data?.message || 'Error posting job');
    } finally {
      setLoading(false);
    }
  };

  if (!user || (user.role !== 'employer' && user.role !== 'admin')) {
    return (
      <div className="error-container">
        <p>Only employers can post jobs. Please register as an employer.</p>
      </div>
    );
  }

  return (
    <div className="post-job-container">
      <div className="post-job-form">
        <h1>Post a Job</h1>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Job Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Senior React Developer"
            />
          </div>

          <div className="form-group">
            <label htmlFor="company">Company Name *</label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="e.g., New York, NY"
              />
            </div>

            <div className="form-group">
              <label htmlFor="jobType">Job Type *</label>
              <select
                id="jobType"
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="salaryMin">Min Salary</label>
              <input
                type="number"
                id="salaryMin"
                name="salaryMin"
                value={formData.salary.min}
                onChange={handleChange}
                placeholder="50000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="salaryMax">Max Salary</label>
              <input
                type="number"
                id="salaryMax"
                name="salaryMax"
                value={formData.salary.max}
                onChange={handleChange}
                placeholder="100000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="currency">Currency</label>
              <select
                id="currency"
                name="currency"
                value={formData.salary.currency}
                onChange={handleChange}
              >
                {currencies.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="experience">Experience Required *</label>
            <input
              type="text"
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              required
              placeholder="e.g., 3+ years"
            />
          </div>

          <div className="form-group">
            <label htmlFor="skills">Required Skills (comma-separated)</label>
            <input
              type="text"
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="React, Node.js, MongoDB"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Job Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Describe the role, responsibilities, and qualifications"
              rows="8"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Posting...' : 'Post Job'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
