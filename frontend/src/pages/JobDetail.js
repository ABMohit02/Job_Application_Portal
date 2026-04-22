import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext, API } from '../context/AuthContext';
import { getCurrencySymbol } from '../utils/currencyHelper';
import './JobDetail.css';

const JobDetail = () => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [formData, setFormData] = useState({ resume: null, coverLetter: '' });
  const [applying, setApplying] = useState(false);
  const [hiredElsewhere, setHiredElsewhere] = useState(null);
  const { id } = useParams();
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading) {
      fetchJob();
    }
  }, [id, authLoading]);

  const fetchJob = async () => {
    try {
      const response = await API.get(`/api/jobs/${id}`);
      setJob(response.data);

      // Check if user is hired elsewhere
      if (user && user.role === 'user') {
        const appsRes = await API.get('/api/applications/user/my-applications');
        const hired = appsRes.data.find(a => a.status === 'hired');
        if (hired && hired.jobId?._id !== id) {
          setHiredElsewhere(hired);
        }
      }
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setApplying(true);
      const data = new FormData();
      data.append('resume', formData.resume);
      data.append('coverLetter', formData.coverLetter);

      const res = await API.post(`/api/applications/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert(res.data.message || 'Application submitted successfully!');
      setShowApplyForm(false);
      setFormData({ resume: null, coverLetter: '' });
      fetchJob(); // Refresh to show new status
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
  if (!job) return <div className="no-jobs">Job not found</div>;

  const myApp = job.myApplication;
  const isRejected = myApp?.status === 'rejected';
  
  // Calculate cooldown
  let cooldownDays = 0;
  if (isRejected) {
    const diff = (Date.now() - new Date(myApp.updatedAt || myApp.appliedAt)) / (1000 * 60 * 60 * 24);
    cooldownDays = Math.ceil(30 - diff); 
  }
  const canReapply = isRejected && cooldownDays <= 0;

  return (
    <div className="job-detail-container">
      <div className="job-detail">
        {/* Status Banners */}
        {myApp && (
          <div className={`app-status-banner status-${myApp.status}`}>
            <div className="status-info">
              <span className="status-label">Your Application Status:</span>
              <span className="status-value">{myApp.status.toUpperCase()}</span>
            </div>
            {isRejected && cooldownDays > 0 && (
              <p className="cooldown-text">
                ⏳ Your application was not selected at this time. <strong>You can re-apply for this after {cooldownDays} days.</strong>
              </p>
            )}
            {myApp.rejectionReason && <p className="status-feedback"><strong>Feedback:</strong> {myApp.rejectionReason}</p>}
            {myApp.status === 'hired' && <p className="celebration-text">🎉 Congratulations! You have been selected for this position.</p>}
          </div>
        )}

        {hiredElsewhere && (
          <div className="hired-block-notice">
            <span className="hired-block-icon">🏢</span>
            <div className="hired-block-info">
              <h3>Application Restricted</h3>
              <p>You are currently hired for the role of <strong>{hiredElsewhere.jobId?.title}</strong> at <strong>{hiredElsewhere.jobId?.company}</strong>. You must resign before you can apply for other roles.</p>
              <Link to="/my-applications" className="manage-app-link">Manage your current job →</Link>
            </div>
          </div>
        )}

        {job.isActive === false && (
          <div className="job-closed-banner">
             <span className="closed-icon">🚫</span>
             <div className="closed-info">
               <h3>This Vacancy is Closed</h3>
               <p>The employer is no longer accepting applications for this position.</p>
             </div>
          </div>
        )}

        <div className="job-detail-header">
          <div>
            <h1>{job.title}</h1>
            <p className="company">{job.company}</p>
          </div>
          <span className="job-type">{job.jobType}</span>
        </div>

        <div className="job-meta">
          <div className="meta-item">
            <strong>Location:</strong> {job.location}
          </div>
          {job.salary && (
            <div className="meta-item">
              <strong>Salary:</strong> ${job.salary.min} - ${job.salary.max}
            </div>
          )}
          <div className="meta-item">
            <strong>Experience:</strong> {job.experience}
          </div>
        </div>

        <div className="job-description">
          <h3>Description</h3>
          <p>{job.description}</p>
        </div>

        {job.skills && job.skills.length > 0 && (
          <div className="job-skills">
            <h3>Required Skills</h3>
            <div className="skills">
              {job.skills.map((skill, idx) => (
                <span key={idx} className="skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="job-actions">
          {user && user.id !== job.postedBy?._id && job.isActive !== false && !hiredElsewhere ? (
            <>
              {(!myApp || (myApp.status === 'applied') || canReapply) && !showApplyForm && (
                <div className="apply-options">
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowApplyForm(true)}
                  >
                    {myApp?.status === 'applied' ? 'Update Application' : canReapply ? 'Re-apply Now' : 'Apply Now'}
                  </button>
                  
                  {user.resume && !myApp && (
                    <button 
                      className="btn btn-outline-primary quick-apply-btn"
                      onClick={() => handleApply({ preventDefault: () => {} })}
                      disabled={applying}
                    >
                      {applying ? 'Submitting...' : '⚡ One-Tap Apply'}
                    </button>
                  )}
                </div>
              )}

              {showApplyForm && (
                <form className="apply-form" onSubmit={handleApply}>
                  <div className="form-group">
                    <label>{myApp ? 'New Resume (PDF) *' : user.resume ? 'Resume (PDF) - Leave empty to use saved one' : 'Resume (PDF) *'}</label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) =>
                        setFormData({ ...formData, resume: e.target.files[0] })
                      }
                      required={!myApp && !user.resume}
                    />
                    {user.resume && <small className="resume-hint">Using your profile resume by default</small>}
                  </div>
                  <div className="form-group">
                    <label>Cover Letter {myApp ? '(Optional)' : '*'}</label>
                    <textarea
                      placeholder={myApp ? "Want to update your message?" : "Tell us why you're a great fit"}
                      value={formData.coverLetter}
                      onChange={(e) =>
                        setFormData({ ...formData, coverLetter: e.target.value })
                      }
                      rows="5"
                      required={!myApp}
                    />
                  </div>
                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={applying}
                    >
                      {applying ? 'Submitting...' : myApp ? 'Save Updates' : 'Submit Application'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowApplyForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : user && user.id === job.postedBy?._id ? (
            <p className="info-message">This is your job posting</p>
          ) : (
            <Link to="/login" className="btn btn-primary">Log in to Apply</Link>
          )}
        </div>

        <div className="employer-info">
          <h3>Contact Information</h3>
          <p><strong>Posted by:</strong> <Link to={`/employer/${job.postedBy._id}`} className="employer-link">{job.postedBy.name}</Link></p>
          <p><strong>Email:</strong> {job.postedBy.email}</p>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
