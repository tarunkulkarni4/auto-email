const mongoose = require('mongoose');

/**
 * Application Schema
 * Tracks each job application including extracted details and generated email
 */
const applicationSchema = new mongoose.Schema(
  {
    hrEmail: {
      type: String,
      required: [true, 'HR email is required'],
      trim: true,
      lowercase: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
    },
    jobDescription: {
      type: String,
      default: '',
    },
    generatedSubject: {
      type: String,
      default: '',
    },
    generatedBody: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['draft', 'created', 'sent'],
      default: 'draft',
    },
    gmailDraftId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Application', applicationSchema);
