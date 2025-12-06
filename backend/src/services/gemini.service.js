// src/services/gemini.service.js
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
  static async generateContent(apiKey, userData, docType) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = docType === 'cv'
        ? this.createCVPrompt(userData)
        : this.createCoverLetterPrompt(userData);

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // Clean up markdown code blocks
      text = text
        .replace(/```[a-zA-Z]*/g, '')  // remove ```json, ```js, etc
        .replace(/```/g, '')           // remove remaining ```
        .replace(/^\s*json\s*\n/i, '') // remove stray "json" line
        .trim();


      return JSON.parse(text);
    } catch (error) {
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  static createCVPrompt(userData) {
    return `You are a professional CV writer. Given the following user information, create a well-structured, 
professional CV content in JSON format. Enhance and professionally rephrase all descriptions.

User Data:
${JSON.stringify(userData, null, 2)}

Return ONLY a JSON object with the following structure:
{
  "personal_info": {
    "full_name": "Full Name",
    "title": "Professional Title",
    "summary": "Professional summary (3-4 sentences)",
    "email": "email@example.com",
    "phone": "phone number",
    "location": "City, Country",
    "linkedin": "LinkedIn URL (if provided)",
    "website": "Website URL (if provided)"
  },
  "summary": "A concise, professional summary of your career.",
  "experience": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "start_date": "MM/YYYY",
      "end_date": "MM/YYYY or Present",
      "description_bullets": ["Point 1", "Point 2"]
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Degree Type",
      "field_of_study": "Field of Study",
      "graduation_date": "MM/YYYY",
      "details": "Notable achievements or coursework"
    }
  ],
  "skills": {
    "core_competencies": ["skill1", "skill2"],
    "software_proficiency": ["tech1", "tech2"],
    "language_fluency": ["lang1", "lang2"]
  },
  "key_projects_achievements": [
    {
      "name": "Project Name",
      "description": "Enhanced project description",
      "key_areas_used": ["tech1", "tech2"]
    }
  ],
  "awards_and_recognitions": [
    "Award name and date"
  ]
}`;
  }

  static createCoverLetterPrompt(userData) {
    return `You are a professional cover letter writer. Create a compelling cover letter in JSON format.

User Data:
${JSON.stringify(userData, null, 2)}

Return ONLY a JSON object with the following structure:
{
  "recipient": {
    "company": "Company Name",
    "hiring_manager": "Hiring Manager Name (if provided)",
    "position": "Position Title"
  },
  "opening": {
    "greeting": "Professional greeting",
    "introduction": "Opening paragraph expressing interest"
  },
  "body": [
    {
      "paragraph": "Body paragraph highlighting relevant experience"
    }
  ],
  "closing": {
    "conclusion": "Closing paragraph with call to action",
    "signature": "Professional closing"
  }
}`;
  }
}