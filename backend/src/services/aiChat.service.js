// src/services/aiChat.service.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import ChatSession from '../models/mongodb/ChatSession.js';
import { DocumentService } from './document.service.js';

export class AIChatService {
	// Standard CV template, remains unchanged
	static EMPTY_CV_TEMPLATE = {
		personal_info: {
			full_name: '',
			title: '',
			phone: '',
			email: '',
			linkedin: '',
			website: '',
			location: '',
		},
		summary: '',
		experience: [],
		education: [],
		skills: {
			core_competencies: [],
			software_proficiency: [],
			language_fluency: [],
			certifications: [],
		},
		key_projects_achievements: [],
		awards_and_recognitions: [],
	};

	// Fields for progress tracking, remains unchanged
	static CV_FIELDS = [
		'personal_info',
		'summary',
		'experience',
		'education',
		'skills',
		'key_projects_achievements',
		'awards_and_recognitions',
	];

	/**
	 * A centralized method for calling the Gemini API.
	 * @param {string} apiKey - The user's Google Gemini API key.
	 * @param {string} prompt - The prompt to send to the model.
	 * @returns {Promise<string>} - The text response from the model.
	 */
	static async _callGemini(apiKey, prompt) {
		try {
			const genAI = new GoogleGenerativeAI(apiKey);
			const model = genAI.getGenerativeModel({ model: 'gemma-3-27b-it' });
			const result = await model.generateContent(prompt);
			return result.response.text();
		} catch (error) {
			console.error('❌ Gemini API call failed:', error.message);
			// Propagate the error to be handled by the calling function
			throw new Error('Failed to get a response from the AI. Please check your API key and try again.');
		}
	}

	/**
	 * Attempts to parse a JSON string, with cleanup for common markdown issues.
	 * @param {string} jsonString - The string to parse.
	 * @returns {object | null} - The parsed object or null if parsing fails.
	 */
	static _parseJsonResponse(jsonString) {
		try {
			const cleanedString = jsonString.replace(/```json/gi, '').replace(/```/g, '').trim();
			return JSON.parse(cleanedString);
		} catch (error) {
			console.error('❌ Failed to parse JSON response from AI:', error);
			console.log('📝 Raw response was:', jsonString);
			return null;
		}
	}

	/**
	 * AI Function 1: Updates the CV JSON based on user's response.
	 * @param {object} currentCv - The current CV data as a JSON object.
	 * @param {string} lastQuestion - The last question the AI asked the user.
	 * @param {string} userResponse - The user's response to the question.
	 * @param {string} apiKey - The user's API key.
	 * @returns {Promise<object>} - The updated CV data.
	 */
	static _normalizeCvData(cvData) {
		if (cvData && Array.isArray(cvData.experience)) {
			cvData.experience.forEach((exp) => {
				// Handle description: AI might send 'description_bullets' or other variations.
				const bullets =
					exp.description_bullets || exp.key_responsibilities || exp.responsibilities;
				if (Array.isArray(bullets)) {
					// Join bullets into a single string with newlines and assign to 'description'.
					exp.description = bullets.join('\n');
					// Clean up old properties to keep the data structure consistent.
					delete exp.description_bullets;
					delete exp.key_responsibilities;
					delete exp.responsibilities;
				}

				// Handle company name variations
				if (exp.company_name) {
					exp.company = exp.company_name;
					delete exp.company_name;
				}

				// Handle job title variations
				if (exp.job_title) {
					exp.title = exp.job_title;
					delete exp.job_title;
				}

				// Handle dates
				if (exp.dates_employed) {
					const dates = exp.dates_employed.split('–').map((d) => d.trim());
					exp.start_date = dates[0];
					exp.end_date = dates[1] || 'Present';
					delete exp.dates_employed;
				}
			});
		}
		return cvData;
	}

	/**
	 * AI Function 1: Updates the CV JSON based on user's response.
	 * @param {object} currentCv - The current CV data as a JSON object.
	 * @param {string} lastQuestion - The last question the AI asked the user.
	 * @param {string} userResponse - The user's response to the question.
	 * @param {string} apiKey - The user's API key.
	 * @returns {Promise<object>} - The updated CV data.
	 */
	static async _updateCvWithUserResponse(currentCv, lastQuestion, userResponse, apiKey) {
		const prompt = `You are a CV data processing expert.
Your task is to update a CV provided in JSON format based on a user's response to a specific question.
Analyze the user's response and integrate the new information into the correct fields of the JSON structure.

**RULES:**
1.  ONLY return the complete, updated JSON object.
2.  Do NOT return any explanatory text, markdown, or anything other than the raw JSON.
3.  If the user's response is unclear or doesn't answer the question, return the original JSON unchanged.
4.  Merge new information correctly. For the 'experience' array, each object MUST follow this structure:
    {
      "company": "Company Name",
      "title": "Job Title",
      "position": "Job Title",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM" or "Present",
      "location": "City, Country",
      "description": "A summary of responsibilities and achievements."
    }
    The 'description' can be a single string or an array of strings under 'description_bullets'.

**Current CV JSON:**
\`\`\`json
${JSON.stringify(currentCv, null, 2)}
\`\`\`

**Question Asked to User:**
"${lastQuestion}"

**User's Response:**
"${userResponse}"

Return the updated and complete JSON object now.`;

		const responseText = await this._callGemini(apiKey, prompt);
		let updatedCv = this._parseJsonResponse(responseText);

		if (!updatedCv) {
			return currentCv;
		}

		// Normalize the data structure after receiving it from the AI.
		updatedCv = this._normalizeCvData(updatedCv);

		// If parsing fails or AI returns non-JSON, return the original CV to avoid data loss.
		return updatedCv || currentCv;
	}

	/**
	 * AI Function 2: Generates the next question based on the current state of the CV.
	 * @param {object} currentCv - The current CV data.
	 * @param {string} docType - The document type ('cv' or 'cover_letter').
	 * @param {string} apiKey - The user's API key.
	 * @returns {Promise<string>} - The next question to ask the user.
	 */
	static async _generateNextQuestion(currentCv, docType, apiKey) {
		const missingFields = this.getMissingFields(this.getCollectedFields(currentCv));
		const progress = this.calculateProgress(this.getCollectedFields(currentCv));

		let systemDirection;
		if (progress >= 100 || missingFields.length === 0) {
			systemDirection = `The user's ${docType} is nearly complete. Politely ask if they have any final additions or if they are ready to finalize the document.`;
		} else {
			const nextField = missingFields[0];
			const questionHint = this.getFollowUpQuestion(nextField);
			systemDirection = `The next topic to ask about is "${nextField}". Your task is to formulate a friendly, conversational question based on this hint: "${questionHint}". Acknowledge the user's progress and ask only ONE question.`;
		}

		const prompt = `You are a helpful and professional CV writing assistant.
Your goal is to help a user build their ${docType} by asking them questions one by one.

**Current CV State:**
\`\`\`json
${JSON.stringify(currentCv, null, 2)}
\`\`\`

**Your Instruction:**
${systemDirection}

Generate and return ONLY the single question you should ask the user next. Do not add any preamble.`;

		return this._callGemini(apiKey, prompt);
	}

	/**
	 * Starts a new chat session.
	 */
	static async startChatSession(userId, initialMessage, docType, apiKey, existingDocId = null) {
		const sessionId = uuidv4();
		let initialCvData;
		let firstQuestion;

		if (existingDocId) {
			try {
				const document = await DocumentService.getDocumentDetail(existingDocId, userId);
				initialCvData = document && document.content_json ? document.content_json : this.EMPTY_CV_TEMPLATE;
			} catch (error) {
				console.error(`Failed to load existing document ${existingDocId}:`, error);
				initialCvData = this.EMPTY_CV_TEMPLATE;
			}
			// Generate a question based on the loaded data
			firstQuestion = await this._generateNextQuestion(initialCvData, docType, apiKey);
		} else {
			// This is for new CVs - process the initial message
			initialCvData = await this._updateCvWithUserResponse(
				this.EMPTY_CV_TEMPLATE,
				'Please provide me with some initial details to start building your CV.',
				initialMessage,
				apiKey,
			);
			firstQuestion = await this._generateNextQuestion(initialCvData, docType, apiKey);
		}

		// Create and save the new chat session.
		const chatSession = await ChatSession.create({
			user_id: userId,
			session_id: sessionId,
			doc_type: docType,
			status: 'active',
			current_cv_data: initialCvData,
			fields_collected: this.getCollectedFields(initialCvData),
			conversation_history: [{ role: 'model', parts: [{ text: firstQuestion }] }],
		});

		// Return the initial state to the frontend.
		return {
			session_id: sessionId,
			message: firstQuestion,
			cv_data: initialCvData,
			progress: this.calculateProgress(chatSession.fields_collected),
			is_complete: this.calculateProgress(chatSession.fields_collected) >= 100,
		};
	}

	/**
	 * Continues an existing chat conversation.
	 */
	static async continueChat(userId, sessionId, userMessage, apiKey) {
		// 1. Retrieve the chat session.
		const chatSession = await ChatSession.findOne({ user_id: userId, session_id: sessionId, status: 'active' });
		if (!chatSession) {
			throw new Error('Chat session not found or has expired.');
		}

		// 2. Get the context: current CV and the last question asked.
		const lastQuestion =
			chatSession.conversation_history.length > 0
				? chatSession.conversation_history[0].parts[0].text
				: 'What should we work on next?';
		const currentCv = chatSession.current_cv_data;

		// 3. Update the CV with the user's new message.
		const updatedCv = await this._updateCvWithUserResponse(currentCv, lastQuestion, userMessage, apiKey);

		let nextQuestion;
		// 4. Check if the CV was actually updated. If not, the AI likely failed to parse the response.
		if (JSON.stringify(updatedCv) === JSON.stringify(currentCv)) {
			// Data has not changed. Ask the user to rephrase.
			nextQuestion = `I'm sorry, I had trouble understanding your response about "${lastQuestion
				.toLowerCase()
				.substring(0, 50)}...". Could you please try rephrasing that for me?`;
		} else {
			// 5. Generate the next logical question based on the updated CV.
			nextQuestion = await this._generateNextQuestion(updatedCv, chatSession.doc_type, apiKey);
		}

		// 6. Update the session in the database.
		chatSession.current_cv_data = updatedCv;
		chatSession.fields_collected = this.getCollectedFields(updatedCv);
		chatSession.conversation_history = [{ role: 'model', parts: [{ text: nextQuestion }] }]; // Overwrite with the new question.
		await chatSession.save();

		const progress = this.calculateProgress(chatSession.fields_collected);
		const isComplete = progress >= 100;

		// 7. Return the new state to the frontend.
		return {
			session_id: sessionId,
			message: nextQuestion,
			cv_data: updatedCv,
			progress: progress,
			is_complete: isComplete,
			fields_collected: chatSession.fields_collected,
			missing_fields: this.getMissingFields(chatSession.fields_collected),
		};
	}

	// --- Helper Methods (mostly unchanged) ---

	static getCollectedFields(cvData) {
		const fields = new Set();
		if (!cvData) return [];

		if (cvData.personal_info && Object.values(cvData.personal_info).some((v) => v)) fields.add('personal_info');
		if (cvData.summary) fields.add('summary');
		if (cvData.experience && cvData.experience.length > 0) fields.add('experience');
		if (cvData.education && cvData.education.length > 0) fields.add('education');
		if (cvData.skills && Object.values(cvData.skills).some((arr) => arr.length > 0)) fields.add('skills');
		if (cvData.key_projects_achievements && cvData.key_projects_achievements.length > 0) fields.add('key_projects_achievements');
		if (cvData.awards_and_recognitions && cvData.awards_and_recognitions.length > 0) fields.add('awards_and_recognitions');

		return Array.from(fields);
	}

	static getMissingFields(collectedFields) {
		return this.CV_FIELDS.filter((field) => !collectedFields.includes(field));
	}

	static calculateProgress(collectedFields) {
		return Math.round((collectedFields.length / this.CV_FIELDS.length) * 100);
	}

	static getFollowUpQuestion(field) {
		const questions = {
			personal_info:
				'Ask for their full name, professional title, and contact information (email, phone, location).',
			summary: "Ask for a brief professional summary (2-3 sentences).",
			experience:
				'Ask about their most recent work experience, including job title, company, dates, and key responsibilities.',
			education: 'Ask about their educational background, like degree, institution, and graduation date.',
			skills: 'Ask what skills, software, or languages they are proficient in.',
			key_projects_achievements: 'Ask about any significant projects or achievements they want to highlight.',
			awards_and_recognitions: 'Ask if they have received any professional awards or recognitions.',
		};
		return questions[field] || `Ask the user about their ${field.replace(/_/g, ' ')}.`;
	}

	/**
	 * Get chat session (unchanged)
	 */
	static async getChatSession(userId, sessionId) {
		return await ChatSession.findOne({ user_id: userId, session_id: sessionId });
	}

	/**
	 * Get user's active sessions (unchanged)
	 */
	static async getUserActiveSessions(userId) {
		return await ChatSession.find({ user_id: userId, status: 'active' }).sort({ updated_at: -1 });
	}
}