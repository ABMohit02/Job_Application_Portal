const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get all jobs with filters
exports.getAllJobs = async (req, res) => {
  try {
    const { search, location, jobType, experience, salaryMin, skills, company, sort, skip = 0, limit = 10 } = req.query;

    let filter = { isActive: { $ne: false } };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (jobType) {
      filter.jobType = jobType;
    }

    if (experience) {
      filter.experience = { $regex: experience, $options: 'i' };
    }

    if (company) {
      filter.company = { $regex: company, $options: 'i' };
    }

    if (salaryMin) {
      filter['salary.min'] = { $gte: parseInt(salaryMin) };
    }

    if (skills) {
      filter.skills = { $in: [new RegExp(skills, 'i')] };
    }

    // Sorting Logic
    let sortObj = { createdAt: -1 };
    if (sort === 'salaryDesc') {
      sortObj = { 'salary.max': -1 };
    } else if (sort === 'salaryAsc') {
      sortObj = { 'salary.min': 1 };
    }

    const jobs = await Job.find(filter)
      .populate('postedBy', 'name company')
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .sort(sortObj);

    const total = await Job.countDocuments(filter);

    let enrichedJobs = jobs;
    if (req.user) {
      enrichedJobs = jobs.map(job => ({
        ...job._doc,
        hasApplied: job.applicants.some(id => id.toString() === req.user.id)
      }));
    }

    res.json({ jobs: enrichedJobs, total, page: Math.floor(skip / limit) + 1 });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching jobs', error: err.message });
  }
};

// Get single job
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name company email');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    let myApplication = null;
    if (req.user) {
      myApplication = await Application.findOne({ jobId: job._id, userId: req.user.id })
        .select('status updatedAt appliedAt rejectionReason shortlistNote feedback missingSkills');
    }

    res.json({ ...job._doc, myApplication });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching job', error: err.message });
  }
};

// Post a job (employer only)
exports.postJob = async (req, res) => {
  try {
    const { title, description, company, location, salary, jobType, experience, skills } = req.body;

    if (!title || !description || !company || !location || !jobType || !experience) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const job = new Job({
      title,
      description,
      company,
      location,
      salary,
      jobType,
      experience,
      skills: skills || [],
      postedBy: req.user.id,
    });

    await job.save();
    res.status(201).json({ message: 'Job posted successfully', job });
  } catch (err) {
    res.status(500).json({ message: 'Error posting job', error: err.message });
  }
};

// Update job
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    const allowedFields = ['title', 'description', 'company', 'location', 'salary', 'jobType', 'experience', 'skills', 'isActive'];
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        job[key] = req.body[key];
      }
    });

    job.updatedAt = Date.now();
    await job.save();

    res.json({ message: 'Job updated successfully', job });
  } catch (err) {
    res.status(500).json({ message: 'Error updating job', error: err.message });
  }
};

// Delete job
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await Application.deleteMany({ jobId: req.params.id });
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job and associated applications deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting job', error: err.message });
  }
};

// ─── PUBLIC: Platform-wide stats for home page live counter ─────────────────
exports.getPlatformStats = async (req, res) => {
  try {
    const [totalJobs, totalApplications, companiesArr, totalUsers] = await Promise.all([
      Job.countDocuments({ isActive: { $ne: false } }),
      Application.countDocuments(),
      Job.distinct('company'),
      User.countDocuments({ role: 'user' }),
    ]);

    res.json({
      totalJobs,
      totalCompanies: companiesArr.length,
      totalApplications,
      totalJobSeekers: totalUsers,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching platform stats', error: err.message });
  }
};

// ─── Employer posting performance stats (enhanced) ───────────────────────────
exports.getEmployerStats = async (req, res) => {
  try {
    const employerId = req.user.id;

    // All jobs posted by this employer
    const jobs = await Job.find({ postedBy: employerId }).sort({ createdAt: -1 });

    if (jobs.length === 0) {
      return res.json({
        jobs: [],
        summary: {
          totalJobs: 0, activeJobs: 0,
          totalApplicants: 0, totalShortlisted: 0, totalRejected: 0, totalHired: 0,
          conversionRate: 0, avgApplicantsPerJob: 0,
        },
        topJob: null,
        applicationsByDay: [],
      });
    }

    const jobIds = jobs.map(j => j._id);

    // Aggregate application counts per job and per status
    const appStats = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      {
        $group: {
          _id: { jobId: '$jobId', status: '$status' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Build a map: jobId -> { status -> count }
    const statsMap = {};
    appStats.forEach(({ _id, count }) => {
      const jid = _id.jobId.toString();
      if (!statsMap[jid]) statsMap[jid] = {};
      statsMap[jid][_id.status] = count;
    });

    const enrichedJobs = jobs.map(job => {
      const jid = job._id.toString();
      const s = statsMap[jid] || {};
      const totalApplicants = Object.values(s).reduce((a, b) => a + b, 0);
      const conversionRate = totalApplicants > 0
        ? Math.round((( (s.shortlisted || 0) + (s.hired || 0) ) / totalApplicants) * 100)
        : 0;
      return {
        _id: job._id,
        title: job.title,
        company: job.company,
        location: job.location,
        jobType: job.jobType,
        isActive: job.isActive,
        createdAt: job.createdAt,
        stats: {
          total: totalApplicants,
          applied: s.applied || 0,
          reviewed: s.reviewed || 0,
          shortlisted: s.shortlisted || 0,
          rejected: s.rejected || 0,
          hired: s.hired || 0,
          conversionRate,
        },
      };
    });

    // Overall summary
    const totalApplicants = enrichedJobs.reduce((a, j) => a + j.stats.total, 0);
    const totalShortlisted = enrichedJobs.reduce((a, j) => a + j.stats.shortlisted, 0);
    const totalHired = enrichedJobs.reduce((a, j) => a + j.stats.hired, 0);
    const overallConversionRate = totalApplicants > 0
      ? Math.round(((totalShortlisted + totalHired) / totalApplicants) * 100)
      : 0;

    const summary = {
      totalJobs: jobs.length,
      activeJobs: jobs.filter(j => j.isActive !== false).length,
      totalApplicants,
      totalShortlisted,
      totalHired: enrichedJobs.reduce((a, j) => a + j.stats.hired, 0),
      totalRejected: enrichedJobs.reduce((a, j) => a + j.stats.rejected, 0),
      totalReviewed: enrichedJobs.reduce((a, j) => a + j.stats.reviewed, 0),
      conversionRate: overallConversionRate,
      avgApplicantsPerJob: jobs.length > 0 ? Math.round(totalApplicants / jobs.length) : 0,
    };

    // Top performing job (most applicants)
    const topJob = [...enrichedJobs].sort((a, b) => b.stats.total - a.stats.total)[0] || null;

    // Applications by day – last 14 days across all employer jobs
    const since14Days = new Date();
    since14Days.setDate(since14Days.getDate() - 13);
    since14Days.setHours(0, 0, 0, 0);

    const dailyAgg = await Application.aggregate([
      { $match: { jobId: { $in: jobIds }, appliedAt: { $gte: since14Days } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$appliedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill gaps for all 14 days
    const dailyMap = {};
    dailyAgg.forEach(d => { dailyMap[d._id] = d.count; });
    const applicationsByDay = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      applicationsByDay.push({ date: key, count: dailyMap[key] || 0 });
    }

    res.json({ jobs: enrichedJobs, summary, topJob, applicationsByDay });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching employer stats', error: err.message });
  }
};
