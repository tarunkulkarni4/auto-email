const mongoose = require('mongoose');

/**
 * User Profile Schema
 * Stores user information for email generation and job applications
 */
const userProfileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      default: 'Tarun Kulkarni',
    },
    education: {
      type: String,
      trim: true,
      default: 'MCA graduate, fresher',
    },
    skills: {
      type: [String],
      default: [],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      default: 'yourname@example.com',
    },
    portfolioLink: {
      type: String,
      trim: true,
      default: '',
    },
    githubLink: {
      type: String,
      trim: true,
      default: '',
    },
    resumePath: {
      type: String,
      default: '',
    },
    resumeOriginalName: {
      type: String,
      default: '',
    },
    gmailTokens: {
      type: Object,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('UserProfile', userProfileSchema);
