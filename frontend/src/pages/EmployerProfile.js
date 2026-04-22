import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API } from '../context/AuthContext';
import './EmployerProfile.css';

const EmployerProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get(`/api/auth/profile/${id}`);
        setProfile(res.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
  if (!profile) return <div className="no-profile">Employer profile not found</div>;

  const { user, jobs } = profile;

  return (
    <div className="epro-page">
      <div className="epro-container">
        {/* Profile Header */}
        <div className="epro-header">
          <div className="epro-avatar-large">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="epro-header-content">
            <div className="epro-badge-row">
              <span className="epro-role-badge">{user.role}</span>
              <span className="epro-date-badge">Joined {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
            </div>
            <h1>{user.name}</h1>
            {user.company && <p className="epro-company-name">🏢 {user.company}</p>}
            <p className="epro-email">📧 {user.email}</p>
          </div>
        </div>

        <div className="epro-main-grid">
          {/* Sidebar Area */}
          <aside className="epro-sidebar">
            <div className="epro-card">
              <h3>{user.role === 'employer' ? 'Recruitment Expertise' : 'Expertise & Skills'}</h3>
              <div className="epro-skills-list">
                {user.skills && user.skills.length > 0 ? (
                  user.skills.map((s, i) => <span key={i} className="epro-skill-chip">{s}</span>)
                ) : (
                  <p className="no-data">{user.role === 'employer' ? 'No focus areas listed' : 'No skills listed'}</p>
                )}
              </div>
            </div>

            <div className="epro-card epro-stats-card">
              <div className="epro-stat-item">
                <span className="epro-stat-val">{jobs.length}</span>
                <span className="epro-stat-lab">Openings</span>
              </div>
              <div className="epro-stat-item">
                <span className="epro-stat-val">{new Date().getFullYear() - new Date(user.createdAt).getFullYear() + 1}y</span>
                <span className="epro-stat-lab">On Platform</span>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="epro-content">
            <div className="epro-card">
              <h3>About Recruiter</h3>
              <p className="epro-bio">
                {user.bio || "This employer hasn't provided a biography yet, but their active involvement in the platform speaks to their commitment to finding top talent."}
              </p>
            </div>

            <div className="epro-jobs-section">
              <div className="epro-section-header">
                <h3>Current Job Openings</h3>
                <span className="epro-count-badge">{jobs.length} Positions</span>
              </div>

              <div className="epro-jobs-grid">
                {jobs.length > 0 ? (
                  jobs.map(job => (
                    <div key={job._id} className="epro-job-card">
                      <div className="epro-job-header">
                        <h4>{job.title}</h4>
                        <span className="epro-job-type">{job.jobType}</span>
                      </div>
                      <p className="epro-job-loc">📍 {job.location}</p>
                      <div className="epro-job-footer">
                        {job.salary && <span className="epro-job-sal">${job.salary.min} - ${job.salary.max}</span>}
                        <Link to={`/job/${job._id}`} className="epro-view-btn">View Details &rarr;</Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="epro-no-jobs">
                    <p>No active openings at the moment.</p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default EmployerProfile;
