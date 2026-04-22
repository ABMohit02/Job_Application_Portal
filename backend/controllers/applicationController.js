const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');

// Apply for a job
exports.applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { resume, coverLetter } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.isActive === false) {
      return res.status(400).json({ message: 'This vacancy has been closed and is no longer accepting applications.' });
    }

    // Check if the user is ALREADY HIRED elsewhere
    const currentlyHired = await Application.findOne({
      userId: req.user.id,
      status: 'hired'
    }).populate('jobId', 'title company');

    if (currentlyHired) {
      return res.status(403).json({ 
        message: `You are currently hired at ${currentlyHired.jobId.company} for the role of ${currentlyHired.jobId.title}. You cannot apply for other jobs until you resign or are released.` 
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      jobId,
      userId: req.user.id,
    });

    if (existingApplication) {
      // Logic for Update (if still pending)
      if (existingApplication.status === 'applied') {
        let resumePath = existingApplication.resume;
        if (req.file) {
          resumePath = req.file.path;
        } else if (!resumePath) {
          return res.status(400).json({ message: 'Please upload an updated PDF resume' });
        }
        
        existingApplication.resume = resumePath;
        existingApplication.coverLetter = req.body.coverLetter || existingApplication.coverLetter;
        await existingApplication.save();
        return res.json({ message: 'Application updated successfully!', application: existingApplication });
      }

      // Logic for Re-application (if rejected after 30 days)
      if (existingApplication.status === 'rejected') {
        const daysSinceRejection = (Date.now() - new Date(existingApplication.updatedAt || existingApplication.appliedAt)) / (1000 * 60 * 60 * 24);
        
        if (daysSinceRejection >= 30) {
          if (!req.file) return res.status(400).json({ message: 'Please upload a new PDF resume for your re-application' });
          
          existingApplication.status = 'applied';
          if (req.file) {
            existingApplication.resume = req.file.path;
          } else {
            // Check if user has a stored resume in profile
            const user = await User.findById(req.user.id);
            if (user.resume) {
              existingApplication.resume = user.resume;
            } else {
              return res.status(400).json({ message: 'Please upload a new PDF resume for your re-application' });
            }
          }
          existingApplication.coverLetter = req.body.coverLetter || existingApplication.coverLetter;
          existingApplication.rejectionReason = undefined;
          existingApplication.missingSkills = [];
          existingApplication.appliedAt = Date.now();
          await existingApplication.save();
          return res.json({ message: 'Re-applied successfully! Good luck this time.', application: existingApplication });
        } else {
          return res.status(400).json({ 
            message: `You can re-apply to this position in ${Math.ceil(30 - daysSinceRejection)} days. Use this time to enhance your skills!` 
          });
        }
      }

      return res.status(400).json({ message: `You have already applied. Current status: ${existingApplication.status.toUpperCase()}` });
    }

    // Create application
    let finalResume = req.file ? req.file.path : null;

    if (!finalResume) {
      // Check for stored resume in profile
      const user = await User.findById(req.user.id);
      if (user.resume) {
        finalResume = user.resume;
      }
    }

    if (!finalResume) {
      return res.status(400).json({ message: 'Please upload a PDF resume' });
    }

    const application = new Application({
      jobId,
      userId: req.user.id,
      resume: finalResume,
      coverLetter,
    });

    await application.save();

    // Add user to job applicants
    job.applicants.push(req.user.id);
    await job.save();

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (err) {
    res.status(500).json({ message: 'Error applying for job', error: err.message });
  }
};

// Get applications for logged-in user
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user.id })
      .populate('jobId', 'title company location')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching applications', error: err.message });
  }
};

// ─── NEW: Analytics summary for logged-in job seeker ────────────────────────
exports.getMyAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const applications = await Application.find({ userId }).sort({ appliedAt: 1 });

    const total = applications.length;
    const byStatus = { applied: 0, reviewed: 0, shortlisted: 0, rejected: 0, hired: 0 };
    applications.forEach(a => { if (byStatus[a.status] !== undefined) byStatus[a.status]++; });

    const shortlistRate = total > 0 ? Math.round(((byStatus.shortlisted + byStatus.hired) / total) * 100) : 0;
    const rejectionRate = total > 0 ? Math.round((byStatus.rejected / total) * 100) : 0;
    const responseRate = total > 0
      ? Math.round(((byStatus.reviewed + byStatus.shortlisted + byStatus.rejected + byStatus.hired) / total) * 100)
      : 0;

    // Last 30 days activity
    const since = new Date();
    since.setDate(since.getDate() - 29);
    since.setHours(0, 0, 0, 0);

    const recentApps = applications.filter(a => new Date(a.appliedAt) >= since);
    const activityMap = {};
    recentApps.forEach(a => {
      const key = new Date(a.appliedAt).toISOString().slice(0, 10);
      activityMap[key] = (activityMap[key] || 0) + 1;
    });

    const activityByDay = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      activityByDay.push({ date: key, count: activityMap[key] || 0 });
    }

    // Most recent application date
    const lastApplied = applications.length > 0
      ? applications[applications.length - 1].appliedAt
      : null;

    res.json({
      total,
      byStatus,
      shortlistRate,
      rejectionRate,
      responseRate,
      activityByDay,
      lastApplied,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching analytics', error: err.message });
  }
};

// Get applications for a job (employer only)
exports.getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Check if job exists and belongs to user
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const applications = await Application.find({ jobId })
      .populate('userId', 'name email')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching applications', error: err.message });
  }
};

// Update application status (employer only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, rejectionReason, shortlistNote, feedback, missingSkills } = req.body;

    const validStatuses = ['applied', 'reviewed', 'shortlisted', 'rejected', 'hired', 'resigned', 'terminated'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const job = await Job.findById(application.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Associated job not found' });
    }
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.status = status;
    
    // Update feedback fields
    if (rejectionReason) application.rejectionReason = rejectionReason;
    if (shortlistNote) application.shortlistNote = shortlistNote;
    if (feedback) application.feedback = feedback;
    if (missingSkills) application.missingSkills = missingSkills;

    await application.save();

    res.json({ message: 'Application status updated with feedback', application });
  } catch (err) {
    res.status(500).json({ message: 'Error updating application', error: err.message });
  }
};

// Seeker resigns from job
exports.resignFromJob = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to resign from this job' });
    }

    if (application.status !== 'hired') {
      return res.status(400).json({ message: 'You can only resign from a job you have been hired for' });
    }

    application.status = 'resigned';
    await application.save();

    res.json({ message: 'You have successfully resigned from this position. You can now apply for other jobs.', application });
  } catch (err) {
    res.status(500).json({ message: 'Error processing resignation', error: err.message });
  }
};

// Get all hired applicants for an employer (Workforce Management)
exports.getWorkforce = async (req, res) => {
  try {
    // 1. Find all jobs posted by the employer
    const employerJobs = await Job.find({ postedBy: req.user.id }).select('_id');
    const jobIds = employerJobs.map((j) => j._id);

    // 2. Find all hired applications for these jobs
    const workforce = await Application.find({
      jobId: { $in: jobIds },
      status: 'hired',
    })
      .populate('userId', 'name email resume')
      .populate('jobId', 'title location');

    res.json(workforce);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching workforce', error: err.message });
  }
};
