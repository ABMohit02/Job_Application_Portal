import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext, API } from '../context/AuthContext';
import './MyApplications.css';

const STEPS = ['applied', 'reviewed', 'shortlisted', 'hired'];

const STATUS_INFO = {
  applied:     { label: 'Applied',     icon: '📬', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.3)', tooltip: 'Your application has been received by the employer.' },
  reviewed:    { label: 'Reviewed',    icon: '👁️', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.3)', tooltip: 'An employer has viewed your profile and resume.' },
  shortlisted: { label: 'Shortlisted', icon: '⭐', color: '#10b981', bg: 'rgba(16,185,129,0.15)',  border: 'rgba(16,185,129,0.3)', tooltip: 'Great news! You are being considered for the next round.' },
  hired:       { label: 'Selected',    icon: '🎊', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)',  border: 'rgba(139,92,246,0.3)', tooltip: 'Congratulations! You have been selected for this position.' },
  rejected:    { label: 'Rejected',    icon: '❌', color: '#ef4444', bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.3)', tooltip: 'The employer has decided to move forward with other candidates.' },
  resigned:    { label: 'Resigned',    icon: '🚶', color: '#64748b', bg: 'rgba(100,116,139,0.15)', border: 'rgba(100,116,139,0.3)', tooltip: 'You have resigned from this position.' },
  terminated:  { label: 'Terminated',  icon: '🛑', color: '#b91c1c', bg: 'rgba(185,28,28,0.15)',   border: 'rgba(185,28,28,0.3)',  tooltip: 'The employer has terminated this relationship.' },
};

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const MyApplications = () => {
  const { user } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appsRes, analyticsRes] = await Promise.all([
        API.get('/api/applications/user/my-applications'),
        API.get('/api/applications/user/analytics')
      ]);
      setApplications(appsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResign = async (applicationId) => {
    if (window.confirm('Are you sure you want to resign from this position? You will be able to apply for other jobs once your resignation is processed.')) {
      try {
        await API.put(`/api/applications/resign/${applicationId}`);
        fetchData();
        alert('You have successfully resigned. You are now free to apply for new roles.');
      } catch (err) {
        alert(err.response?.data?.message || 'Error processing resignation');
      }
    }
  };

  if (!user) return <div className="mya-loading"><div className="mya-spinner"></div></div>;

  // Summary counts
  const counts = {
    all: applications.length,
    applied: applications.filter(a => a.status === 'applied').length,
    reviewed: applications.filter(a => a.status === 'reviewed').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);

  const getStepIndex = (status) => {
    if (status === 'rejected') return -1;
    return STEPS.indexOf(status);
  };

  return (
    <div className="mya-page">
      {/* Header */}
      <div className="mya-header">
        <div>
          <h1>📋 My Applications</h1>
          <p>Track the status of every job you've applied to</p>
        </div>
        <Link to="/jobs" className="mya-browse-btn">🔍 Browse More Jobs</Link>
      </div>

      {/* Analytics Strip */}
      {analytics && (
        <div className="mya-analytics-row">
          <div className="mya-ana-card">
            <span className="mya-ana-val">{analytics.total}</span>
            <span className="mya-ana-lab">Total Applied</span>
          </div>
          <div className="mya-ana-card">
            <span className="mya-ana-val" style={{ color: '#10b981' }}>{analytics.shortlistRate}%</span>
            <span className="mya-ana-lab">Shortlist Rate</span>
          </div>
          <div className="mya-ana-card">
            <span className="mya-ana-val" style={{ color: '#3b82f6' }}>{analytics.responseRate}%</span>
            <span className="mya-ana-lab">Response Rate</span>
          </div>
          <div className="mya-ana-card heatmap-container">
            <span className="mya-ana-lab">30-Day Activity</span>
            <div className="mya-heatmap">
              {analytics.activityByDay.map((d, i) => (
                <div 
                  key={i} 
                  className={`mya-heat-cell heat-${Math.min(d.count, 3)}`}
                  title={`${d.date}: ${d.count} apps`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Summary Filter Cards */}
      <div className="mya-summary-row">
        {[
          { key: 'all',        label: 'All',         icon: '📊', colorClass: 'mya-card-all'        },
          { key: 'applied',    label: 'Applied',     icon: '📬', colorClass: 'mya-card-applied'    },
          { key: 'reviewed',   label: 'Reviewed',    icon: '👁️', colorClass: 'mya-card-reviewed'   },
          { key: 'shortlisted',label: 'Shortlisted', icon: '⭐', colorClass: 'mya-card-shortlisted'},
          { key: 'hired',      label: 'Selected',    icon: '🎊', colorClass: 'mya-card-hired'      },
          { key: 'rejected',   label: 'Rejected',    icon: '❌', colorClass: 'mya-card-rejected'   },
        ].map(({ key, label, icon, colorClass }) => (
          <button
            key={key}
            className={`mya-summary-card ${colorClass} ${filter === key ? 'mya-summary-active' : ''}`}
            onClick={() => setFilter(key)}
          >
            <span className="mya-sum-icon">{icon}</span>
            <div className="mya-sum-text">
              <span className="mya-sum-count">{counts[key]}</span>
              <span className="mya-sum-label">{label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="mya-loading"><div className="mya-spinner"></div><p>Loading applications…</p></div>
      ) : filtered.length === 0 ? (
        <div className="mya-empty">
          <div className="mya-empty-icon">📭</div>
          <h3>{filter === 'all' ? "You haven't applied to any jobs yet." : `No ${filter} applications.`}</h3>
          {filter === 'all' && <Link to="/jobs" className="mya-browse-btn">Browse Jobs</Link>}
          {filter !== 'all' && <button className="mya-browse-btn" onClick={() => setFilter('all')}>Show All</button>}
        </div>
      ) : (
        <div className="mya-list">
          {filtered.map((app) => {
            const info = STATUS_INFO[app.status] || STATUS_INFO.applied;
            const stepIdx = getStepIndex(app.status);
            const isRejected = app.status === 'rejected';
            const isExpanded = expandedId === app._id;

            return (
              <div
                key={app._id}
                className={`mya-card ${isRejected ? 'mya-card-rejected-border' : ''} ${isExpanded ? 'mya-card-expanded' : ''}`}
                style={{ borderLeftColor: info.color }}
              >
                {/* Card Header */}
                <div className="mya-card-top" onClick={() => setExpandedId(isExpanded ? null : app._id)}>
                  <div className="mya-card-left">
                    <div className="mya-company-avatar" style={{ background: `linear-gradient(135deg, ${info.color}88, ${info.color}44)`, borderColor: info.border }}>
                      {(app.jobId?.company || 'J').charAt(0).toUpperCase()}
                    </div>
                    <div className="mya-card-info">
                      <h3>{app.jobId?.title || 'Job Deleted'}</h3>
                      <p className="mya-company">{app.jobId?.company || 'N/A'}</p>
                      <p className="mya-location">📍 {app.jobId?.location || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="mya-card-right">
                    <div className="mya-status-wrapper">
                      <span
                        className="mya-status-pill"
                        style={{ background: info.bg, color: info.color, border: `1px solid ${info.border}` }}
                      >
                        {info.icon} {info.label}
                      </span>
                      <div className="mya-tooltip-hint">? <span className="mya-tooltip-text">{info.tooltip}</span></div>
                    </div>
                    <p className="mya-date">Applied {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    <span className="mya-expand-arrow">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Progress Stepper */}
                {!isRejected ? (
                  <div className="mya-stepper">
                    {STEPS.map((step, i) => {
                      const done = i <= stepIdx;
                      const active = i === stepIdx;
                      return (
                        <React.Fragment key={step}>
                          <div className={`mya-step ${done ? 'mya-step-done' : ''} ${active ? 'mya-step-active' : ''}`}>
                            <div className="mya-step-dot" style={done ? { background: info.color, borderColor: info.color } : {}}>
                              {done ? '✓' : i + 1}
                            </div>
                            <span className="mya-step-label">{STATUS_INFO[step].label}</span>
                          </div>
                          {i < STEPS.length - 1 && (
                            <div className={`mya-step-line ${i < stepIdx ? 'mya-step-line-done' : ''}`}
                              style={i < stepIdx ? { background: info.color } : {}}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mya-rejected-banner">
                    <p>❌ Your application was not selected for this position. Don't give up — keep applying!</p>
                    {(() => {
                      const updatedAt = app.updatedAt || app.appliedAt;
                      const daysSinceRejection = (Date.now() - new Date(updatedAt)) / (1000 * 60 * 60 * 24);
                      const cooldownDays = Math.ceil(30 - daysSinceRejection);
                      return cooldownDays > 0 ? (
                        <p className="mya-cooldown-text">⏳ <strong>You can re-apply for this after {cooldownDays} days.</strong></p>
                      ) : (
                        <p className="mya-cooldown-ready">✅ <strong>You are now eligible to re-apply!</strong> Visit the job page to submit an updated profile.</p>
                      );
                    })()}
                  </div>
                )}

                {/* Professional Feedback Banners */}
                {app.status === 'hired' && (
                  <div className="mya-feedback-banner mya-hired-note">
                    ✨ <strong>Congratulations!</strong> You have been officially selected for this role. The employer will contact you soon with next steps.
                  </div>
                )}
                {isRejected && app.rejectionReason && (
                  <div className="mya-feedback-banner mya-rejected-note">
                    <strong>Reason:</strong> {app.rejectionReason}
                  </div>
                )}
                {app.status === 'shortlisted' && app.shortlistNote && (
                  <div className="mya-feedback-banner mya-shortlist-note">
                    ⭐ <strong>What stood out:</strong> {app.shortlistNote}
                  </div>
                )}

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mya-expanded-body">
                    {/* Feedback Block */}
                    {(app.feedback || (app.missingSkills && app.missingSkills.length > 0)) && (
                      <div className="mya-professional-feedback">
                        <h3>💡 Professional Feedback</h3>
                        
                        {app.missingSkills && app.missingSkills.length > 0 && (
                          <div className="mya-skills-gap">
                            <p>Based on the job requirements, you might want to strengthen your expertise in:</p>
                            <div className="mya-gap-tags">
                              {app.missingSkills.map((skill, i) => (
                                <span key={i} className="mya-gap-tag">{skill}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {app.feedback && (
                          <div className="mya-advice">
                            <p className="mya-advice-label">Advice for improvement:</p>
                            <p className="mya-advice-text">"{app.feedback}"</p>
                          </div>
                        )}
                      </div>
                    )}

                    {app.coverLetter && (
                      <div className="mya-detail-block">
                        <h4>📝 Your Cover Letter</h4>
                        <p>{app.coverLetter}</p>
                      </div>
                    )}
                    
                    <div className="mya-meta-actions">
                      {app.resume && (
                        <a
                          href={`${API_BASE_URL}/uploads/${app.resume.split(/[\\/]/).pop()}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mya-resume-link"
                        >
                          📄 View Attached Resume
                        </a>
                      )}
                      {app.jobId && (
                        <Link to={`/job/${app.jobId._id}`} className="mya-view-job-btn">
                          View Original Posting →
                        </Link>
                      )}
                      {app.status === 'hired' && (
                        <button
                          className="mya-resign-btn"
                          onClick={() => handleResign(app._id)}
                        >
                          🚪 Resign from this Position
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
