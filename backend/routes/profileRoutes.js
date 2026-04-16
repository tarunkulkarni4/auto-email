const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile } = require('../controllers/profileController');
const { uploadResume } = require('../middleware/upload');

/**
 * Profile Routes
 * GET  /api/user-profile  - Fetch user profile
 * POST /api/user-profile  - Create/update user profile (with optional resume upload)
 */

router.get('/user-profile', getUserProfile);
router.post('/user-profile', uploadResume.single('resume'), updateUserProfile);

module.exports = router;
