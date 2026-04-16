const express = require('express');
const router = express.Router();
const { uploadImage, extractDetails, analyzeJob, generateEmail, getApplications, deleteApplication } = require('../controllers/applicationController');
const { uploadImage: imageUpload } = require('../middleware/upload');

/**
 * Application Routes
 * POST /api/upload-image     - Upload screenshot & run OCR
 * POST /api/extract-details  - Parse job details from OCR text using AI
 * POST /api/generate-email   - Generate application email using AI
 */

router.post('/upload-image', imageUpload.single('image'), uploadImage);
router.post('/extract-details', extractDetails);
router.post('/analyze-job', analyzeJob);
router.post('/generate-email', generateEmail);
router.get('/', getApplications);
router.delete('/:id', deleteApplication);

module.exports = router;
