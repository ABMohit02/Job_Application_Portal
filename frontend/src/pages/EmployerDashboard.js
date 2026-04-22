import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext, API } from '../context/AuthContext';
import './EmployerDashboard.css';

const STATUS_LABELS = {
  applied: 'Applied',
  reviewed: 'Reviewed',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
  hired: 'Selected',
};

const STATUS_COLORS = {
  applied: '#3b82f6',
  reviewed: '#f59e0b',
  shortlisted: '#10b981',
  rejected: '#ef4444',
  hired: '#8b5cf6', // Indigo/Purple for selected candidates
};

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const EmployerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [workforce, setWorkforce] = useState([]);
  const [workforceLoading, setWorkforceLoading] = useState(false);

  // Feedback Modal State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    applicationId: '',
    status: '',
    rejectionReason: '',
    shortlistNote: '',
    feedback: '',
    missingSkills: []
  });

  useEffect(() => {
    fetchStats();
    fetchWorkforce();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get('/api/jobs/employer/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkforce = async () => {
    setWorkforceLoading(true);
    try {
      const res = await API.get('/api/applications/employer/workforce');
      setWorkforce(res.data);
    } catch (err) {
      console.error('Error fetching workforce:', err);
    } finally {
      setWorkforceLoading(false);
    }
  };

  const fetchApplicants = async (jobId) => {
    setApplicantsLoading(true);
    setApplicants([]);
    try {
      const res = await API.get(`/api/applications/job/${jobId}`);
      setApplicants(res.data);
    } catch (err) {
      console.error('Error fetching applicants:', err);
    } finally {
      setApplicantsLoading(false);
    }
  };

  const handleJobClick = (job) => {
    if (selectedJob?._id === job._id) {
      setSelectedJob(null);
      setApplicants([]);
      return;
    }
    setSelectedJob(job);
    fetchApplicants(job._id);
  };

  const openFeedbackModal = (applicationId, newStatus) => {
    if (newStatus === 'rejected' || newStatus === 'shortlisted') {
      setFeedbackData({
        applicationId,
        status: newStatus,
        rejectionReason: '',
        shortlistNote: '',
        feedback: '',
        missingSkills: []
      });
      setShowFeedbackModal(true);
    } else {
      updateStatus(applicationId, newStatus);
    }
  };

  const updateStatus = async (applicationId, newStatus, feedbackOverrides = {}) => {
    setUpdatingId(applicationId);
    try {
      const payload = { 
        status: newStatus,
        ...feedbackOverrides
      };
      
      await API.put(`/api/applications/${applicationId}/status`, payload);
      
      setApplicants(prev =>
        prev.map(a => a._id === applicationId ? { ...a, status: newStatus, ...feedbackOverrides } : a)
      );
      
      // Refresh summary stats and workforce
      fetchStats();
      fetchWorkforce();
      showToast(`Status updated to "${STATUS_LABELS[newStatus]}"`, 'success');
      setShowFeedbackModal(false);
    } catch (err) {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleJobOpenStatus = async (jobId, currentStatus) => {
    try {
      const res = await API.put(`/api/jobs/${jobId}`, { isActive: !currentStatus });
      setStats(prev => ({
        ...prev,
        jobs: prev.jobs.map(j => j._id === jobId ? { ...j, isActive: res.data.job.isActive } : j)
      }));
      showToast(`Job ${!currentStatus ? 'Re-opened' : 'Closed'} successfully`, 'success');
    } catch (err) {
      showToast('Failed to update job status', 'error');
    }
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    updateStatus(feedbackData.applicationId, feedbackData.status, {
      rejectionReason: feedbackData.rejectionReason,
      shortlistNote: feedbackData.shortlistNote,
      feedback: feedbackData.feedback,
      missingSkills: feedbackData.missingSkills
    });
  };

  const toggleMissingSkill = (skill) => {
    setFeedbackData(prev => ({
      ...prev,
      missingSkills: prev.missingSkills.includes(skill)
        ? prev.missingSkills.filter(s => s !== skill)
        : [...prev.missingSkills, skill]
    }));
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (!user) return <div className="emp-loading"><div className="spinner"></div></div>;

  if (loading) return (
    <div className="emp-loading">
      <div className="spinner"></div>
      <p>Loading your dashboard…</p>
    </div>
  );

  const summary = stats?.summary || {};
  const jobs = stats?.jobs || [];
  const topJob = stats?.topJob || null;
  const applicationsByDay = stats?.applicationsByDay || [];

  // Simple Donut Chart Calculation
  const totalApps = summary.totalApplicants || 0;
  let currentOffset = 0;
  const donutData = ['applied', 'reviewed', 'shortlisted', 'rejected', 'hired'].map(s => {
    const val = summary[`total${s.charAt(0).toUpperCase() + s.slice(1)}`] || (s === 'applied' ? (totalApps - (summary.totalReviewed || 0) - (summary.totalShortlisted || 0) - (summary.totalRejected || 0) - (summary.totalHired || 0)) : 0);
    const percent = totalApps > 0 ? (val / totalApps) * 100 : 0;
    const dashArray = `${percent} ${100 - percent}`;
    const offset = 100 - currentOffset;
    currentOffset += percent;
    return { status: s, percent, dashArray, offset };
  });

  return (
    <div className="emp-page">
      {toast && (
        <div className={`emp-toast emp-toast-${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="emp-modal-overlay">
          <div className="emp-modal">
            <div className="emp-modal-header">
              <h3>Professional Feedback: {STATUS_LABELS[feedbackData.status]}</h3>
              <button className="emp-modal-close" onClick={() => setShowFeedbackModal(false)}>×</button>
            </div>
            <form onSubmit={handleModalSubmit} className="emp-modal-body">
              {feedbackData.status === 'rejected' && (
                <div className="emp-form-group">
                  <label>Primary Rejection Reason</label>
                  <select 
                    value={feedbackData.rejectionReason} 
                    onChange={e => setFeedbackData({...feedbackData, rejectionReason: e.target.value})}
                    required
                  >
                    <option value="">Select a reason...</option>
                    <option value="Missing technical skills">Missing technical skills</option>
                    <option value="Insufficient experience">Insufficient experience</option>
                    <option value="Culture fit">Culture fit / Communication</option>
                    <option value="Overqualified">Overqualified</option>
                    <option value="Position filled">Position filled</option>
                    <option value="Resume formatting issues">Resume formatting / Clarity</option>
                  </select>
                </div>
              )}

              {feedbackData.status === 'shortlisted' && (
                <div className="emp-form-group">
                  <label>Shortlist Highlight (What stood out?)</label>
                  <input 
                    type="text"
                    placeholder="e.g. Exceptional portfolio, Great project experience..."
                    value={feedbackData.shortlistNote}
                    onChange={e => setFeedbackData({...feedbackData, shortlistNote: e.target.value})}
                    required
                  />
                </div>
              )}

              <div className="emp-form-group">
                <label>Identify Gaps (Skills the candidate lacks)</label>
                <div className="emp-skills-selector">
                  {selectedJob?.skills?.map((skill, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`emp-skill-tag ${feedbackData.missingSkills.includes(skill) ? 'selected' : ''}`}
                      onClick={() => toggleMissingSkill(skill)}
                    >
                      {skill}
                    </button>
                  ))}
                  {(!selectedJob?.skills || selectedJob.skills.length === 0) && <p className="emp-no-skills">No skills defined for this job.</p>}
                </div>
              </div>

              <div className="emp-form-group">
                <label>Additional Professional Advice</label>
                <textarea 
                  rows="4"
                  placeholder="Provide constructive feedback to help the candidate improve..."
                  value={feedbackData.feedback}
                  onChange={e => setFeedbackData({...feedbackData, feedback: e.target.value})}
                ></textarea>
              </div>

              <div className="emp-modal-footer">
                <button type="button" className="emp-btn-secondary" onClick={() => setShowFeedbackModal(false)}>Cancel</button>
                <button type="submit" className="emp-btn-primary" disabled={updatingId}>
                  {updatingId ? 'Submitting...' : 'Submit Feedback & Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="emp-header">
        <div className="emp-header-text">
          <h1>📊 Posting Performance</h1>
          <p>Track who's interested in your jobs and manage applicants</p>
        </div>
        <Link to="/post-job" className="emp-post-btn">+ Post New Job</Link>
      </div>

      {/* Analytics Overview Grid */}
      <div className="emp-analytics-grid">
        {/* Main Stats */}
        <div className="emp-main-stats">
          <div className="emp-summary-grid">
            <div className="emp-stat-card emp-stat-blue">
              <div className="emp-stat-icon">💼</div>
              <div className="emp-stat-value">{summary.totalJobs || 0}</div>
              <div className="emp-stat-label">Total Jobs</div>
            </div>
            <div className="emp-stat-card emp-stat-purple">
              <div className="emp-stat-icon">👥</div>
              <div className="emp-stat-value">{summary.totalApplicants || 0}</div>
              <div className="emp-stat-label">Total Applicants</div>
            </div>
            <div className="emp-stat-card emp-stat-amber">
              <div className="emp-stat-icon">⭐</div>
              <div className="emp-stat-value">{summary.conversionRate || 0}%</div>
              <div className="emp-stat-label">Conv. Rate</div>
            </div>
            <div className="emp-stat-card emp-stat-green">
              <div className="emp-stat-icon">📈</div>
              <div className="emp-stat-value">{summary.avgApplicantsPerJob || 0}</div>
              <div className="emp-stat-label">Avg. Per Job</div>
            </div>
          </div>

          {/* Sparkline (Application Trend) */}
          <div className="emp-trend-card">
            <h3>Weekly Application Trend</h3>
            <div className="emp-sparkline">
              {applicationsByDay.map((d, i) => (
                <div 
                   key={i} 
                  className="emp-spark-bar" 
                  style={{ height: `${totalApps > 0 ? (d.count / (Math.max(...applicationsByDay.map(x => x.count)) || 1)) * 100 : 0}%` }}
                  title={`${d.date}: ${d.count} apps`}
                />
              ))}
            </div>
            <div className="emp-spark-labels">
              <span>{applicationsByDay[0]?.date}</span>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="emp-chart-card">
          <h3>Application Status Split</h3>
          <div className="emp-donut-container">
            <svg viewBox="0 0 42 42" className="emp-donut">
              <circle className="emp-donut-hole" cx="21" cy="21" r="15.91549430918954" fill="transparent"></circle>
              <circle className="emp-donut-ring" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f3f4f6" strokeWidth="3"></circle>
              {donutData.map((d, i) => (
                <circle
                  key={i}
                  className="emp-donut-segment"
                  cx="21" cy="21" r="15.91549430918954"
                  fill="transparent"
                  stroke={STATUS_COLORS[d.status]}
                  strokeWidth="3"
                  strokeDasharray={d.dashArray}
                  strokeDashoffset={d.offset}
                ></circle>
              ))}
              <g className="emp-donut-text">
                <text x="50%" y="50%" className="emp-donut-number">{totalApps}</text>
                <text x="50%" y="50%" className="emp-donut-label">Total</text>
              </g>
            </svg>
            <div className="emp-donut-legend">
              {['applied', 'reviewed', 'shortlisted', 'rejected', 'hired'].map(s => (
                <div key={s} className="emp-legend-item">
                  <span className="emp-legend-dot" style={{ backgroundColor: STATUS_COLORS[s] }}></span>
                  <span className="emp-legend-text">{STATUS_LABELS[s]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performer Card */}
        <div className="emp-top-card">
          <h3>🔥 Top Performing Job</h3>
          {topJob ? (
            <div className="emp-top-content">
              <h4>{topJob.title}</h4>
              <p>{topJob.location} • {topJob.jobType}</p>
              <div className="emp-top-stat">
                <span className="emp-top-count">{topJob.stats.total}</span>
                <span className="emp-top-label">Total Applicants</span>
              </div>
              <div className="emp-top-bar-outer">
                <div className="emp-top-bar-inner" style={{ width: '100%' }}></div>
              </div>
            </div>
          ) : (
            <p className="emp-empty-text">No active performance data</p>
          )}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="emp-tips-strip">
        <span className="emp-tip-icon">💡</span>
        <p><strong>Pro Tip:</strong> Higher conversion rates mean your job descriptions are attracting the right talent! Keep them clear and concise.</p>
      </div>

      {/* Jobs List */}
      <div className="emp-section">
        <h2 className="emp-section-title">Your Job Listings</h2>
        {jobs.length === 0 ? (
          <div className="emp-empty">
            <div className="emp-empty-icon">📭</div>
            <h3>No jobs posted yet</h3>
            <p>Start by posting your first job to attract talent.</p>
            <Link to="/post-job" className="emp-post-btn">Post a Job</Link>
          </div>
        ) : (
          <div className="emp-jobs-list">
            {jobs.map(job => (
              <div key={job._id} className={`emp-job-card ${selectedJob?._id === job._id ? 'emp-job-card-active' : ''}`}>
                <div className="emp-job-header" onClick={() => handleJobClick(job)}>
                  <div className="emp-job-info">
                    <h3>{job.title}</h3>
                    <div className="emp-job-meta">
                      <span>🏢 {job.company}</span>
                      <span>📍 {job.location}</span>
                      <span>🏷️ {job.jobType}</span>
                      <span className={`emp-active-badge ${job.isActive === false ? 'inactive' : 'active'}`}>
                        {job.isActive === false ? 'Inactive' : 'Active'}
                      </span>
                    </div>
                    <div className="emp-job-actions-row">
                      <p className="emp-job-date">Posted: {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      <button 
                        className={`emp-toggle-status-btn ${job.isActive === false ? 'btn-reopen' : 'btn-close'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleJobOpenStatus(job._id, job.isActive);
                        }}
                      >
                        {job.isActive === false ? '🔓 Re-open Opening' : '🔒 Close Opening'}
                      </button>
                    </div>
                  </div>

                  {/* Mini bar chart */}
                  <div className="emp-job-stats">
                    {['applied', 'reviewed', 'shortlisted', 'hired', 'rejected'].map(s => (
                      <div key={s} className="emp-mini-stat">
                        <div className="emp-mini-bar-wrap">
                          <div
                            className="emp-mini-bar"
                            style={{
                              height: `${Math.min(100, (job.stats[s] / Math.max(job.stats.total, 1)) * 100)}%`,
                              backgroundColor: STATUS_COLORS[s]
                            }}
                          />
                        </div>
                        <span className="emp-mini-count" style={{ color: STATUS_COLORS[s] }}>{job.stats[s]}</span>
                        <span className="emp-mini-label">{s}</span>
                      </div>
                    ))}
                    <div className="emp-total-badge">
                      <span>{job.stats.total}</span>
                      <small>total</small>
                    </div>
                    <div className="emp-expand-arrow">{selectedJob?._id === job._id ? '▲' : '▼'}</div>
                  </div>
                </div>

                {/* Applicants Panel */}
                {selectedJob?._id === job._id && (
                  <div className="emp-applicants-panel">
                    <h4 className="emp-app-panel-title">👥 Applicants for "{job.title}"</h4>
                    {applicantsLoading ? (
                      <div className="emp-app-loading"><div className="spinner spinner-sm"></div> Loading applicants…</div>
                    ) : applicants.length === 0 ? (
                      <div className="emp-no-applicants">No applications received yet.</div>
                    ) : (
                      <div className="emp-applicants-grid">
                        {applicants.map(app => (
                          <div key={app._id} className="emp-applicant-card">
                            <div className="emp-applicant-avatar">
                              {app.userId?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div className="emp-applicant-info">
                              <h5>{app.userId?.name || 'Unknown'}</h5>
                              <p className="emp-applicant-email">{app.userId?.email || 'N/A'}</p>
                              <p className="emp-applicant-date">Applied: {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                              {app.coverLetter && (
                                <p className="emp-cover-snippet">"{app.coverLetter.substring(0, 80)}…"</p>
                              )}
                              {app.resume && (
                                <a
                                  href={`${API_BASE_URL}/uploads/${app.resume.split(/[\\/]/).pop()}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="emp-resume-link"
                                >
                                  📄 View Resume
                                </a>
                              )}
                            </div>
                            <div className="emp-applicant-actions">
                              <span className={`emp-status-badge emp-status-${app.status}`}>{STATUS_LABELS[app.status]}</span>
                              <select
                                className="emp-status-select"
                                value={app.status}
                                disabled={updatingId === app._id}
                                onChange={e => openFeedbackModal(app._id, e.target.value)}
                              >
                                <option value="applied">Mark Applied</option>
                                <option value="reviewed">Mark Reviewed</option>
                                <option value="shortlisted">Shortlist ⭐</option>
                                <option value="hired">Select Candidate 🎊</option>
                                <option value="rejected">Reject ❌</option>
                              </select>
                              {updatingId === app._id && <div className="spinner spinner-sm"></div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Workforce Management Section */}
      <div className="emp-section emp-workforce-section">
        <div className="emp-section-header">
          <h2 className="emp-section-title">👥 Active Workforce</h2>
          <span className="emp-workforce-count">{workforce.length} Employee{workforce.length !== 1 ? 's' : ''}</span>
        </div>
        
        {workforceLoading ? (
          <div className="emp-loading-small"><div className="spinner spinner-sm"></div> Loading workforce…</div>
        ) : workforce.length === 0 ? (
          <div className="emp-empty-small">
            <p>No active employees found. Hire candidates to see them here.</p>
          </div>
        ) : (
          <div className="emp-workforce-grid">
            {workforce.map((emp) => (
              <div key={emp._id} className="emp-wf-card">
                <div className="emp-wf-header">
                  <div className="emp-wf-avatar">
                    {emp.userId?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="emp-wf-meta">
                    <h4>{emp.userId?.name}</h4>
                    <span className="emp-wf-job">{emp.jobId?.title}</span>
                  </div>
                </div>
                <div className="emp-wf-body">
                  <div className="emp-wf-info">
                    <p>📧 {emp.userId?.email}</p>
                    <p>📅 Hired on: {new Date(emp.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="emp-wf-actions">
                    {emp.userId?.resume && (
                      <a
                        href={`${API_BASE_URL}/uploads/${emp.userId.resume.split(/[\\/]/).pop()}`}
                        target="_blank"
                        rel="noreferrer"
                        className="emp-wf-link"
                      >
                        📄 Resume
                      </a>
                    )}
                    <button 
                      className="emp-wf-btn-terminate"
                      onClick={() => openFeedbackModal(emp._id, 'terminated')}
                    >
                      🛑 Release
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboard;
