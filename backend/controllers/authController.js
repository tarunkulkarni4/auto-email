const { oauth2Client, getAuthUrl } = require('../config/google');
const gmailService = require('../services/gmailService');
const UserProfile = require('../models/UserProfile');
const Application = require('../models/Application');
const path = require('path');

/**
 * Auth Controller
 * Handles Google OAuth2 authentication and Gmail draft creation
 */

/**
 * Auth Controller
 * Handles Google OAuth2 authentication and Gmail draft creation
 */

// PERSISTENCE: Now using UserProfile model to store tokens so they survive server restarts

// GET /api/auth/google - Redirect to Google OAuth consent screen
const googleAuth = (req, res) => {
  try {
    const authUrl = getAuthUrl();
    res.status(200).json({
      success: true,
      data: { authUrl },
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate auth URL',
    });
  }
};

// GET /api/auth/google/callback - Handle OAuth callback from Google
const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}?auth=error&message=No authorization code`);
    }

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // PERSIST TO DATABASE
    await UserProfile.findOneAndUpdate({}, { gmailTokens: tokens }, { upsert: true });

    console.log('✅ Google OAuth tokens saved to database');

    // Redirect back to frontend with success
    res.redirect(`${process.env.FRONTEND_URL}?auth=success`);
  } catch (error) {
    console.error('Google Callback Error:', error);
    res.redirect(`${process.env.FRONTEND_URL}?auth=error&message=${encodeURIComponent(error.message)}`);
  }
};

// GET /api/auth/status - Check if user is authenticated
const authStatus = async (req, res) => {
  let userEmail = null;
  let isAuthenticated = false;

  try {
    const profile = await UserProfile.findOne();
    if (profile && profile.gmailTokens) {
      gmailService.setCredentials(profile.gmailTokens);
      userEmail = await gmailService.getUserEmail();
      isAuthenticated = true;
    }
  } catch (e) {
    console.error('Error fetching user email for status:', e.message);
    isAuthenticated = false;
  }

  res.status(200).json({
    success: true,
    data: { isAuthenticated, userEmail },
  });
};

// POST /api/auth/logout - Clear stored tokens
const logout = async (req, res) => {
  try {
    await UserProfile.findOneAndUpdate({}, { gmailTokens: null });
    
    // Only try to revoke if we have a token, otherwise ignore the error
    try {
      if (oauth2Client.credentials) {
        await oauth2Client.revokeCredentials();
      }
    } catch (e) {
      console.log('No token to revoke or already revoked');
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/create-draft - Create a Gmail draft with resume attachment
const createDraft = async (req, res) => {
  try {
    // Load tokens from DB
    const profile = await UserProfile.findOne();
    if (!profile || !profile.gmailTokens) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated with Google. Please login first.',
      });
    }

    const tokens = profile.gmailTokens;

    // Set credentials
    oauth2Client.setCredentials(tokens);
    gmailService.setCredentials(tokens);

    const { to, subject, body } = req.body;

    // Validate required fields
    if (!to || !subject || !body) {
      return res.status(400).json({
        success: false,
        error: 'Recipient (to), subject, and body are required',
      });
    }

    // Get sender email
    const fromEmail = await gmailService.getUserEmail();

    // Determine resume path
    let resumePath = null;
    let resumeName = null;
    if (profile && profile.resumePath) {
      const fullResumePath = path.resolve(profile.resumePath);
      const fs = require('fs');
      if (fs.existsSync(fullResumePath)) {
        resumePath = fullResumePath;
        resumeName = profile.resumeOriginalName || 'Resume.pdf';
      }
    }

    // Create Gmail draft
    const draft = await gmailService.createDraft({
      to,
      subject,
      body,
      fromEmail,
      resumePath,
      resumeName,
    });

    // Save application record
    await Application.create({
      hrEmail: to,
      company: req.body.company || 'Unknown',
      role: req.body.role || 'Unknown',
      jobDescription: req.body.jobDescription || '',
      generatedSubject: subject,
      generatedBody: body,
      status: 'created',
      gmailDraftId: draft.id,
    });

    res.status(200).json({
      success: true,
      data: {
        draftId: draft.id,
        gmailUrl: `https://mail.google.com/mail/u/0/#drafts`,
        message: 'Draft created successfully! Open Gmail to review and send.',
      },
    });
  } catch (error) {
    console.error('Create Draft Error:', error);

    // Handle token rotation/expiry
    if (error.message?.includes('invalid_grant') || error.message?.includes('Token')) {
      await UserProfile.findOneAndUpdate({}, { gmailTokens: null });
      return res.status(401).json({
        success: false,
        error: 'Google authentication expired. Please login again.',
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create Gmail draft',
    });
  }
};

module.exports = { googleAuth, googleCallback, authStatus, logout, createDraft };
