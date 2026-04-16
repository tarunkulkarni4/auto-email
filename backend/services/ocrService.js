const Tesseract = require('tesseract.js');
const path = require('path');

/**
 * OCR Service - Extracts text from uploaded images using Tesseract.js
 */
class OCRService {
  /**
   * Extract text from an image file
   * @param {string} imagePath - Absolute path to the image file
   * @returns {Promise<string>} Extracted text
   */
  static async extractText(imagePath) {
    try {
      console.log(`🔍 Starting OCR on: ${imagePath}`);

      const result = await Tesseract.recognize(imagePath, 'eng', {
        logger: (info) => {
          if (info.status === 'recognizing text') {
            console.log(`   OCR Progress: ${(info.progress * 100).toFixed(1)}%`);
          }
        },
      });

      const extractedText = result.data.text.trim();
      console.log(`✅ OCR Complete. Extracted ${extractedText.length} characters.`);

      return extractedText;
    } catch (error) {
      console.error('❌ OCR Error:', error.message);
      throw new Error(`OCR extraction failed: ${error.message}`);
    }
  }
}

module.exports = OCRService;
