const { google } = require('googleapis');
const { oauth2Client } = require('../config/google');
const fs = require('fs');
const path = require('path');

/**
 * Gmail Service - Handles Gmail API operations
 * Creates draft emails with PDF resume attachments
 */
class GmailService {
  /**
   * Set OAuth2 credentials (tokens) on the client
   * @param {Object} tokens - { access_token, refresh_token, ... }
   */
  setCredentials(tokens) {
    oauth2Client.setCredentials(tokens);
  }

  /**
   * Build a raw RFC 2822 MIME email message with attachment
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {string} body - Email body text
   * @param {string} fromEmail - Sender email
   * @param {string|null} attachmentPath - Path to PDF file to attach
   * @param {string|null} attachmentName - Display name for the attachment
   * @returns {string} Base64url-encoded MIME message
   */
  buildRawEmail(to, subject, body, fromEmail, attachmentPath = null, attachmentName = null) {
    const boundary = '----=_Part_' + Date.now().toString(36);

    let message = '';
    message += `From: ${fromEmail}\r\n`;
    message += `To: ${to}\r\n`;
    message += `Subject: ${subject}\r\n`;
    message += `MIME-Version: 1.0\r\n`;

    if (attachmentPath && fs.existsSync(attachmentPath)) {
      // Multipart message with attachment
      message += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`;

      // HTML body part
      const htmlBody = body.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
      message += `--${boundary}\r\n`;
      message += `Content-Type: text/html; charset="UTF-8"\r\n`;
      message += `Content-Transfer-Encoding: 7bit\r\n\r\n`;
      message += `${htmlBody}\r\n\r\n`;

      // PDF attachment part
      const fileContent = fs.readFileSync(attachmentPath);
      const base64File = fileContent.toString('base64');
      const fileName = attachmentName || path.basename(attachmentPath);

      message += `--${boundary}\r\n`;
      message += `Content-Type: application/pdf; name="${fileName}"\r\n`;
      message += `Content-Disposition: attachment; filename="${fileName}"\r\n`;
      message += `Content-Transfer-Encoding: base64\r\n\r\n`;
      message += `${base64File}\r\n`;

      message += `--${boundary}--`;
    } else {
      // HTML message without attachment
      const htmlBody = body.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
      message += `Content-Type: text/html; charset="UTF-8"\r\n\r\n`;
      message += htmlBody;
    }

    // Convert to base64url encoding (Gmail API requirement)
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return encodedMessage;
  }

  /**
   * Create a Gmail draft with optional PDF attachment
   * @param {Object} params - Draft parameters
   * @param {string} params.to - Recipient email
   * @param {string} params.subject - Email subject
   * @param {string} params.body - Email body
   * @param {string} params.fromEmail - Sender email
   * @param {string|null} params.resumePath - Path to resume PDF
   * @param {string|null} params.resumeName - Resume filename
   * @returns {Promise<Object>} Created draft data
   */
  async createDraft({ to, subject, body, fromEmail, resumePath = null, resumeName = null }) {
    try {
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

      const raw = this.buildRawEmail(to, subject, body, fromEmail, resumePath, resumeName);

      const draft = await gmail.users.drafts.create({
        userId: 'me',
        requestBody: {
          message: {
            raw: raw,
          },
        },
      });

      console.log(`✅ Gmail Draft created: ${draft.data.id}`);
      return draft.data;
    } catch (error) {
      console.error('❌ Gmail Draft Error:', error.message);
      throw new Error(`Failed to create Gmail draft: ${error.message}`);
    }
  }

  /**
   * Get authenticated user's email address
   * @returns {Promise<string>} User email address
   */
  async getUserEmail() {
    try {
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      const profile = await gmail.users.getProfile({ userId: 'me' });
      return profile.data.emailAddress;
    } catch (error) {
      throw new Error(`Failed to get user email: ${error.message}`);
    }
  }
}

module.exports = new GmailService();
