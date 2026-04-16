/**
 * Grok AI Service - Handles all AI-related operations
 * Uses the Grok API (xAI) for text parsing and email generation
 */
class GrokService {
  constructor() {
    this.apiKey = process.env.GROK_API_KEY;
    this.baseUrl = 'https://api.groq.com/openai/v1';
  }

  /**
   * Send a chat completion request to Grok API
   * @param {string} systemPrompt - System role instructions
   * @param {string} userPrompt - User message content
   * @returns {Promise<string>} AI response text
   */
  async chatCompletion(systemPrompt, userPrompt) {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Grok API error (${response.status}): ${errorData}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('❌ Grok API Error:', error.message);
      throw error;
    }
  }

  /**
   * Clean up messy raw OCR text using AI
   * @param {string} rawText - Raw text from Tesseract
   * @returns {Promise<string>} Cleaned, readable text
   */
  async cleanOCR(rawText) {
    const systemPrompt = `You are a text cleaning expert. Clean up this messy OCR output from a job posting. 
1. Fix common OCR typos (e.g. '0' instead of 'O', '|' instead of 'l').
2. Restore proper capitalization and basic formatting (paragraphs/bullets).
3. Do NOT add any new information.
4. Response should be JUST the cleaned text, no explanations.`;

    return await this.chatCompletion(systemPrompt, rawText);
  }

  /**
   * Parse OCR text to extract job details using AI
   * @param {string} ocrText - Raw text extracted from image via OCR
   * @returns {Promise<Object>} Parsed job details { hr_email, company, role, job_description }
   */
  async parseJobDetails(ocrText) {
    const systemPrompt = `You are a job posting parser. Extract structured information from raw text.
Always respond with valid JSON only, no markdown, no explanation.
The JSON must have these exact keys: "hr_email", "company", "role", "job_description".
If a field cannot be found, use an empty string "".
For job_description, provide a concise summary of requirements and responsibilities.`;

    const userPrompt = `Extract job details from this text:\n\n${ocrText}`;

    const response = await this.chatCompletion(systemPrompt, userPrompt);

    try {
      // Clean response - remove markdown code blocks if present
      let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('❌ Failed to parse Grok response as JSON:', response);
      throw new Error('Failed to parse job details from AI response');
    }
  }

  /**
   * Generate a professional application email using AI
   * @param {Object} params - Email generation parameters
   * @param {string} params.name - Applicant name
   * @param {string} params.education - Education background
   * @param {string[]} params.skills - List of skills
   * @param {string} params.phone - Phone number
   * @param {string} params.portfolioLink - Portfolio URL
   * @param {string} params.company - Target company name
   * @param {string} params.role - Job role
   * @param {string} params.jobDescription - Job description
   * @returns {Promise<Object>} Generated email { subject, body }
   */
  async generateEmail({ name, education, skills, phone, portfolioLink, company, role, jobDescription }) {
    const systemPrompt = `You are a professional email writer for job applications.
Generate a concise, professional job application email.

STRICT RULES:
1. Email must be 120-160 words.
2. NO emojis.
3. Automatically correct technical acronyms (e.g., use 'OOP', not 'OPP').
4. The introduction MUST mention name: "${name}" and education: "${education}".
5. Mention the role and company.
6. Match skills to the JD, but keep paragraphs short (max 3-4 sentences each).

STRUCTURE:
- Greeting: (Dear Hiring Manager, / Dear HR Team,)
- P1: Introduction & background.
- P2: Why this role/company + matching skills.
- P3: Resume mention & interview request.
- Signature: Separated by double newline. Name, Phone, and Portfolio Link each on a new line.

Respond with valid JSON: { "subject": "...", "body": "..." }
STRICT FORMATTING: 
- DO NOT use literal newlines (Enter key) inside JSON strings. Use \\n instead.
- Use double line breaks (\\n\\n) between EVERY section (Greeting to P1, P1 to P2, etc.).
- Use single line breaks (\\n) ONLY for signature lines.
- Ensure the portfolio link "${portfolioLink}" is at the very end.
- Use a professional, human-like tone, avoid being overly repetitive.`;

    const userPrompt = `Generate an application email with these details:
- Name: ${name}
- Education: ${education}
- Skills: ${skills.join(', ')}
- Phone: ${phone}
- Portfolio: ${portfolioLink}
- Company: ${company}
- Role: ${role}
- Job Description: ${jobDescription}`;

    const response = await this.chatCompletion(systemPrompt, userPrompt);

    try {
      // 1. Basic cleaning
      let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // 2. Fix literal newlines: Check if there are raw newlines inside what should be a JSON string
      // This is a common AI error where it doesn't escape \n as \\n
      try {
        return JSON.parse(cleaned);
      } catch (e) {
        // Attempt to escape literal newlines and tabs that break JSON.parse
        const fixed = cleaned
          .replace(/\n/g, '\\n')    // Escape actual newlines
          .replace(/\t/g, '\\t')    // Escape actual tabs
          .replace(/\\n\s*{\\n/g, '{') // Fix accidental escaping of structural braces
          .replace(/\\n\s*}\\n/g, '}') 
          .replace(/\\n\s*"/g, '"');
          
        // Re-try parsing. If this fails, we fall back to the main catch block.
        // Actually, a safer way to handle this is to extract properties via Regex if JSON failing
        const subjectMatch = cleaned.match(/"subject":\s*"(.*?)"/s);
        const bodyMatch = cleaned.match(/"body":\s*"(.*?)"/s);
        
        if (subjectMatch && bodyMatch) {
          return {
            subject: subjectMatch[1].replace(/\\n/g, '\n').trim(),
            body: bodyMatch[1].replace(/\\n/g, '\n').trim()
          };
        }
        throw e;
      }
    } catch (error) {
      console.error('❌ Failed to parse email generation response:', response);
      throw new Error('Failed to generate email from AI response');
    }
  }

  /**
   * Analyze job requirements against user skills
   * @param {string} jobDescription 
   * @param {string[]} userSkills 
   * @returns {Promise<Object>} { matchScore, missingKeywords }
   */
  async analyzeSkillGaps(jobDescription, userSkills) {
    const systemPrompt = `You are an HR analyzer. Compare the job description with the user's skill list.
Respond with valid JSON only: { "matchScore": 0-100, "missingKeywords": ["skill1", "skill2"], "tips": "short tip" }
Focus only on key technical skills and tools.`;

    const userPrompt = `JOB DESCRIPTION:\n${jobDescription}\n\nUSER SKILLS: ${userSkills.join(', ')}`;

    const response = await this.chatCompletion(systemPrompt, userPrompt);
    try {
      let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      return { matchScore: 0, missingKeywords: [], tips: "Analysis failed" };
    }
  }
}

module.exports = new GrokService();
