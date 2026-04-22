import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext, API } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user, setUser } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    bio: '',
    skills: '',
    resume: null
  });

  useEffect(() => {
    if (user) {
      fetchAnalytics();
      setFormData({
        name: user.name || '',
        company: user.company || '',
        bio: user.bio || '',
        skills: user.skills ? user.skills.join(', ') : '',
        resume: null
      });
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      if (user.role === 'user') {
        const res = await API.get('/api/applications/user/analytics');
        setAnalytics(res.data);
      } else if (user.role === 'employer') {
        const res = await API.get('/api/jobs/employer/stats');
        setAnalytics(res.data.summary);
      }
    } catch (err) {
      console.error('Error fetching dashboard analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      if (user.role === 'employer') data.append('company', formData.company);
      data.append('bio', formData.bio);
      data.append('skills', formData.skills ? JSON.stringify(formData.skills.split(',').map(s => s.trim())) : '[]');
      if (formData.resume) data.append('resume', formData.resume);
      
      const res = await API.put('/api/auth/me', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(prev => ({ ...prev, ...res.data.user }));
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  if (!user) {
    return <div className="loading">Loading profile...</div>;
  }

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  return (
    <div className="dashboard-container">
      {/* Edit Profile Modal */}
      {showModal && (
        <div className="dash-modal-overlay">
          <div className="dash-modal">
            <div className="dash-modal-header">
              <h3>Update Your Profile</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleEditSubmit} className="dash-modal-body">
              <div className="dash-form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              {user.role === 'employer' && (
                <div className="dash-form-group">
                  <label>Company Name</label>
                  <input 
                    type="text" 
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    required
                  />
                </div>
              )}
              <div className="dash-form-group">
                <label>Professional Bio</label>
                <textarea 
                  rows="3"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                />
              </div>
              <div className="dash-form-group">
                <label>{user.role === 'employer' ? 'Hiring Expertise / Focus (Comma separated)' : 'Skills (Comma separated)'}</label>
                <input 
                  type="text" 
                  placeholder={user.role === 'employer' ? "Tech, Design, Marketing..." : "React, Node.js, Design..."}
                  value={formData.skills}
                  onChange={(e) => setFormData({...formData, skills: e.target.value})}
                />
              </div>
              {user.role === 'user' && (
                <div className="dash-form-group">
                  <label>Default Resume (PDF)</label>
                  <input 
                    type="file" 
                    accept=".pdf"
                    onChange={(e) => setFormData({...formData, resume: e.target.files[0]})}
                  />
                  {user.resume && <small className="current-resume-notice">Current resume: {user.resume.split(/[\\/]/).pop()}</small>}
                </div>
              )}
              <div className="dash-modal-actions">
                <button type="button" className="cancel-pill" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="save-pill" disabled={editLoading}>
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="dashboard">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="header-info">
            <h1>Welcome back, {user.name}!</h1>
            <p className="role-badge">{user.role}</p>
          </div>
        </div>

        {/* Analytics / Quick Stats Cards */}
        {!loading && analytics && (
          <div className="dashboard-stats-strip">
            {user.role === 'user' ? (
              <>
                <div className="dash-stat-pill">
                  <span className="pill-val">{analytics.total}</span>
                  <span className="pill-lab">Applied</span>
                </div>
                <div className="dash-stat-pill">
                  <span className="pill-val" style={{ color: '#10b981' }}>{analytics.shortlistRate || 0}%</span>
                  <span className="pill-lab">Success</span>
                </div>
                <div className="dash-stat-pill">
                  <span className="pill-val" style={{ color: '#3b82f6' }}>{analytics.responseRate || 0}%</span>
                  <span className="pill-lab">Response</span>
                </div>
              </>
            ) : (
              <>
                <div className="dash-stat-pill">
                  <span className="pill-val">{analytics.totalJobs || 0}</span>
                  <span className="pill-lab">Jobs Posted</span>
                </div>
                <div className="dash-stat-pill">
                  <span className="pill-val">{analytics.totalApplicants || 0}</span>
                  <span className="pill-lab">Applicants</span>
                </div>
                <div className="dash-stat-pill">
                  <span className="pill-val" style={{ color: '#f59e0b' }}>{analytics.conversionRate || 0}%</span>
                  <span className="pill-lab">Conv. Rate</span>
                </div>
              </>
            )}
          </div>
        )}

        <div className="dashboard-main-grid">
          <div className="profile-card profile-details-box">
            <h3>Account Details</h3>
            <div className="detail-row">
              <span className="detail-label">Full Name</span>
              <span className="detail-value">{user.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email Address</span>
              <span className="detail-value">{user.email}</span>
            </div>
            {user.role === 'employer' && (
              <div className="detail-row">
                <span className="detail-label">Company</span>
                <span className="detail-value">{user.company || 'N/A'}</span>
              </div>
            )}
            {user.bio && (
              <div className="detail-row dash-bio-row">
                <span className="detail-label">Bio</span>
                <span className="detail-value dash-bio-text">{user.bio}</span>
              </div>
            )}
            {user.skills && user.skills.length > 0 && (
              <div className="detail-row dash-skills-row">
                <span className="detail-label">Skills</span>
                <div className="dash-skills-list">
                  {user.skills.map((s, i) => <span key={i} className="skill-mini-badge">{s}</span>)}
                </div>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">Member Since</span>
              <span className="detail-value">{new Date(user.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
            </div>
            {user.role === 'user' && user.resume && (
              <div className="detail-row">
                <span className="detail-label">Stored Resume</span>
                <a 
                  href={`${API_BASE_URL}/uploads/${user.resume.split(/[\\/]/).pop()}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="resume-view-pill"
                >
                  📄 View Saved Resume
                </a>
              </div>
            )}
            <button className="edit-profile-btn" onClick={() => setShowModal(true)}>Edit Details</button>
          </div>

          <div className="profile-card profile-actions-box">
            <h3>Quick Actions</h3>
            <div className="action-grid">
              {user.role === 'employer' && (
                <>
                  <Link to="/post-job" className="action-link">
                    <span className="action-ico">📝</span>
                    <span className="action-txt">Post New Job</span>
                  </Link>
                  <Link to="/employer-dashboard" className="action-link primary-link">
                    <span className="action-ico">📊</span>
                    <span className="action-txt">Performance Dashboard</span>
                  </Link>
                  <Link to="/jobs" className="action-link">
                    <span className="action-ico">🔍</span>
                    <span className="action-txt">Browse All Jobs</span>
                  </Link>
                </>
              )}
              {user.role === 'user' && (
                <>
                  <Link to="/jobs" className="action-link primary-link">
                    <span className="action-ico">🚀</span>
                    <span className="action-txt">Explore Jobs</span>
                  </Link>
                  <Link to="/my-applications" className="action-link">
                    <span className="action-ico">📋</span>
                    <span className="action-txt">My Applications</span>
                  </Link>
                  <Link to="/" className="action-link">
                    <span className="action-ico">🏠</span>
                    <span className="action-txt">Go Home</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* New Prominent Resume Section for Seekers */}
          {user.role === 'user' && (
            <div className="profile-card resume-direct-box">
              <h3>📄 Your Professional Resume</h3>
              <div className="resume-status-card">
                {user.resume ? (
                  <div className="resume-info-active">
                    <div className="res-icon">✅</div>
                    <div className="res-details">
                      <p className="res-label">Resume is active and ready for one-click apply.</p>
                      <a 
                        href={`${API_BASE_URL}/uploads/${user.resume.split(/[\\/]/).pop()}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="res-view-link"
                      >
                        Preview Current Resume
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="resume-info-missing">
                    <div className="res-icon">⚠️</div>
                    <div className="res-details">
                      <p className="res-label">No resume uploaded yet. Add one to enable One-Tap Apply.</p>
                    </div>
                  </div>
                )}
                
                <div className="resume-upload-zone">
                  <label htmlFor="direct-resume-upload" className="custom-upload-btn">
                    {user.resume ? 'Update Resume (PDF)' : 'Upload Resume (PDF)'}
                  </label>
                  <input 
                    type="file" 
                    id="direct-resume-upload" 
                    accept=".pdf" 
                    style={{ display: 'none' }} 
                    onChange={async (e) => {
                      if (e.target.files[0]) {
                        setEditLoading(true);
                        try {
                          const data = new FormData();
                          data.append('resume', e.target.files[0]);
                          const res = await API.put('/api/auth/me', data, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                          });
                          setUser(prev => ({ ...prev, ...res.data.user }));
                          alert('Resume updated successfully!');
                        } catch (err) {
                          alert('Failed to upload resume');
                        } finally {
                          setEditLoading(false);
                        }
                      }
                    }}
                  />
                  {editLoading && <span className="uploading-spinner">Uploading...</span>}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="dashboard-tips">
          <h4>💡 Insight Center</h4>
          <p>
            {user.role === 'user' 
              ? "Complete your profile to increase your success rate. Candidates with detailed cover letters get 2x more shortlists!" 
              : "Keep your job postings active and detailed. Providing salary ranges increases applicant quality by up to 40%."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
