const UserProfile = require('../models/UserProfile');
const path = require('path');
const fs = require('fs');

/**
 * User Profile Controller
 * Handles CRUD operations for user profile data
 */

// GET /api/user-profile - Fetch user profile
const getUserProfile = async (req, res) => {
  try {
    // Get the first (and likely only) user profile
    let profile = await UserProfile.findOne();

    if (!profile) {
      // Create a default profile if none exists
      profile = await UserProfile.create({
        name: 'Tarun Kulkarni',
        education: 'MCA graduate, fresher',
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express', 'HTML', 'CSS'],
        phone: '',
        email: 'yourname@example.com',
        portfolioLink: '',
        githubLink: '',
      });
    }

    // Add resume URL if resume exists
    const profileObj = profile.toObject();
    if (profileObj.resumePath) {
      profileObj.resumeUrl = `/uploads/${path.basename(profileObj.resumePath)}`;
    }

    res.status(200).json({
      success: true,
      data: profileObj,
    });
  } catch (error) {
    console.error('❌ Error fetching profile:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch user profile',
    });
  }
};

// POST /api/user-profile - Create or update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { name, education, skills, phone, email, portfolioLink, githubLink } = req.body;

    // Parse skills if it comes as a comma-separated string
    let parsedSkills = skills;
    if (typeof skills === 'string') {
      parsedSkills = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const updateData = {
      name: name || 'Tarun Kulkarni',
      education: education || 'MCA graduate, fresher',
      skills: parsedSkills || [],
      phone: phone || '',
      email: email || 'yourname@example.com',
      portfolioLink: portfolioLink || '',
      githubLink: githubLink || '',
    };

    // Handle resume file upload
    if (req.file) {
      updateData.resumePath = req.file.path;
      updateData.resumeOriginalName = req.file.originalname;
    }

    console.log('📡 Updating profile with data:', JSON.stringify(updateData, null, 2));

    // Upsert: update if exists, create if not
    const profile = await UserProfile.findOneAndUpdate({}, updateData, {
      new: true,
      upsert: true,
      runValidators: true,
    });

    const profileObj = profile.toObject();
    if (profileObj.resumePath) {
      profileObj.resumeUrl = `/uploads/${path.basename(profileObj.resumePath)}`;
    }

    res.status(200).json({
      success: true,
      data: profileObj,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('❌ Error updating profile:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update user profile',
    });
  }
};

module.exports = { getUserProfile, updateUserProfile };
