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
      text = text.replace(/``````\n?/g, '').trim();
      
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
  "profile": {
    "name": "Full Name",
    "title": "Professional Title",
    "summary": "Professional summary (3-4 sentences)"
  },
  "contact": {
    "email": "email@example.com",
    "phone": "phone number",
    "location": "City, Country",
    "linkedin": "LinkedIn URL (if provided)",
    "website": "Website URL (if provided)"
  },
  "experience": [
    {
      "company": "Company Name",
      "position": "Job Title",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY or Present",
      "description": "Enhanced professional description"
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Degree Type",
      "field": "Field of Study",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY",
      "description": "Notable achievements"
    }
  ],
  "skills": [
    {
      "category": "Category Name",
      "items": ["skill1", "skill2", "skill3"]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Enhanced project description",
      "technologies": ["tech1", "tech2"],
      "url": "Project URL (if provided)"
    }
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