const express = require('express');
const router = express.Router();
const { googleAuth, googleCallback, authStatus, logout, createDraft } = require('../controllers/authController');

/**
 * Auth & Gmail Routes
 * GET  /api/auth/google           - Get Google OAuth URL
 * GET  /api/auth/google/callback  - OAuth callback handler
 * GET  /api/auth/status           - Check authentication status
 * POST /api/auth/logout           - Clear OAuth tokens
 * POST /api/create-draft          - Create Gmail draft with attachment
 */

router.get('/auth/google', googleAuth);
router.get('/auth/google/callback', googleCallback);
router.get('/auth/status', authStatus);
router.post('/auth/logout', logout);
router.post('/create-draft', createDraft);

module.exports = router;
