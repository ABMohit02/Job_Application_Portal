const express = require('express');
const router = express.Router();
const {
  getAllJobs,
  getJobById,
  postJob,
  updateJob,
  deleteJob,
  getEmployerStats,
  getPlatformStats,
} = require('../controllers/jobController');
const { authMiddleware, employerMiddleware, optionalAuth } = require('../middleware/auth');

// Public routes (no auth required)
router.get('/platform/stats', getPlatformStats);

// Employer-only routes (must come before /:id to avoid conflicts)
router.get('/employer/stats', authMiddleware, employerMiddleware, getEmployerStats);

// General job routes
router.get('/', optionalAuth, getAllJobs);
router.get('/:id', optionalAuth, getJobById);
router.post('/', authMiddleware, employerMiddleware, postJob);
router.put('/:id', authMiddleware, employerMiddleware, updateJob);
router.delete('/:id', authMiddleware, employerMiddleware, deleteJob);

module.exports = router;
