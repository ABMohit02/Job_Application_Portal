const express = require('express');
const router = express.Router();
const { register, login, getMe, updateMe, getPublicProfile } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../utils/multer');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.put('/me', authMiddleware, upload.single('resume'), updateMe);
router.get('/profile/:id', getPublicProfile);

module.exports = router;
