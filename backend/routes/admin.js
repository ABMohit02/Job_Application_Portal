const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  getAllJobsAdmin,
  deleteUser,
  updateUserRole,
} = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/stats', authMiddleware, adminMiddleware, getDashboardStats);
router.get('/users', authMiddleware, adminMiddleware, getAllUsers);
router.get('/jobs', authMiddleware, adminMiddleware, getAllJobsAdmin);
router.delete('/users/:userId', authMiddleware, adminMiddleware, deleteUser);
router.put('/users/:userId/role', authMiddleware, adminMiddleware, updateUserRole);

module.exports = router;
