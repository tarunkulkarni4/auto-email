const OCRService = require('../services/ocrService');
const grokService = require('../services/grokService');
const UserProfile = require('../models/UserProfile');
const Application = require('../models/Application');
const path = require('path');
const fs = require('fs');

/**
 * Application Controller
 * Handles image upload, OCR extraction, AI parsing, and email generation
 */

// POST /api/upload-image - Upload image and extract text via OCR
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file uploaded',
      });
    }

    const imagePath = req.file.path;
    console.log(`📁 Image uploaded: ${imagePath}`);

    // Extract text using OCR
    const rawText = await OCRService.extractText(imagePath);

    if (!rawText || rawText.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Could not extract meaningful text from the image. Please try a clearer image.',
      });
    }

    // Clean up the messy OCR text using Grok AI
    const extractedText = await grokService.cleanOCR(rawText);

    res.status(200).json({
      success: true,
      data: {
        extractedText,
        imagePath: `/uploads/${path.basename(imagePath)}`,
      },
    });
  } catch (error) {
    console.error('Upload/OCR Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process image',
    });
  }
};

// POST /api/extract-details - Use AI to parse job details from text
const extractDetails = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient text to extract details from',
      });
    }

    // Use Grok AI to parse the OCR text into structured data
    const details = await grokService.parseJobDetails(text);

    res.status(200).json({
      success: true,
      data: {
        hr_email: details.hr_email || '',
        company: details.company || '',
        role: details.role || '',
        job_description: details.job_description || '',
      },
    });
  } catch (error) {
    console.error('Extract Details Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to extract job details',
    });
  }
};

// POST /api/generate-email - Generate application email using AI
const generateEmail = async (req, res) => {
  try {
    const { company, role, jobDescription, hrEmail } = req.body;

    // Validate required fields
    if (!company || !role) {
      return res.status(400).json({
        success: false,
        error: 'Company name and role are required',
      });
    }

    // Fetch user profile for personalization
    const profile = await UserProfile.findOne();
    if (!profile) {
      return res.status(400).json({
        success: false,
        error: 'Please set up your profile first',
      });
    }

    // Generate email using Grok AI
    const emailData = await grokService.generateEmail({
      name: profile.name,
      education: profile.education,
      skills: profile.skills,
      phone: profile.phone,
      portfolioLink: profile.portfolioLink,
      company,
      role,
      jobDescription: jobDescription || '',
    });

    // Save application to database for history
    const application = new Application({
      hrEmail: hrEmail || '',
      company,
      role,
      jobDescription: jobDescription || '',
      generatedSubject: emailData.subject,
      generatedBody: emailData.body,
      status: 'draft',
    });
    await application.save();

    res.status(200).json({
      success: true,
      data: {
        id: application._id,
        to: hrEmail || '',
        subject: emailData.subject,
        body: emailData.body,
        resumeAttached: !!profile.resumePath,
        resumeName: profile.resumeOriginalName || 'Resume.pdf',
      },
    });
  } catch (error) {
    console.error('Generate Email Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate email',
    });
  }
};

const getApplications = async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch applications',
    });
  }
};

const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    await Application.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Application deleted' });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete application',
    });
  }
};

const analyzeJob = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription) return res.status(400).json({ success: false, error: 'Job description required' });

    const profile = await UserProfile.findOne();
    const userSkills = profile ? profile.skills : [];

    const analysis = await grokService.analyzeSkillGaps(jobDescription, userSkills);
    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { uploadImage, extractDetails, analyzeJob, generateEmail, getApplications, deleteApplication };
