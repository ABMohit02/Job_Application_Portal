const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getMyApplications,
  getMyAnalytics,
  getJobApplications,
  updateApplicationStatus,
  resignFromJob,
  getWorkforce,
} = require('../controllers/applicationController');
const { authMiddleware, employerMiddleware } = require('../middleware/auth');
const upload = require('../utils/multer');

// Job seeker routes
router.get('/user/my-applications', authMiddleware, getMyApplications);
router.get('/user/analytics', authMiddleware, getMyAnalytics);
router.put('/resign/:applicationId', authMiddleware, resignFromJob);

// Employer routes
router.get('/job/:jobId', authMiddleware, employerMiddleware, getJobApplications);
router.get('/employer/workforce', authMiddleware, employerMiddleware, getWorkforce);
router.put('/:applicationId/status', authMiddleware, employerMiddleware, updateApplicationStatus);

// Apply for a job (must be last to avoid conflicts)
router.post('/:jobId', authMiddleware, upload.single('resume'), applyForJob);

module.exports = router;
