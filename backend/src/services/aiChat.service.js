// src/services/aiChat.service.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import ChatSession from '../models/mongodb/ChatSession.js';
import { decryptAPIKey } from '../utils/encryption.js';

export class AIChatService {
	static activeChats = new Map();
	// Standard CV template
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

	// Fields tracking for progress
	static CV_FIELDS = [
		'personal_info',
		'summary',
		'experience',
		'education',
		'skills',
		'key_projects_achievements',
	];

	/**
	 * Start a new chat session
	 */
	static async startChatSession(userId, initialMessage, docType, apiKey) {
		const sessionId = uuidv4();

		const systemInstruction = this.getSystemInstruction(docType);

		const genAI = new GoogleGenerativeAI(apiKey);
		const model = genAI.getGenerativeModel({
			model: 'gemini-2.5-flash',
			generationConfig: {
				temperature: 0.7,
				maxOutputTokens: 1000,
			},
		});

		const contextPrompt = `${systemInstruction}\n\nUser's initial information: ${initialMessage}\n\nAnalyze this information, acknowledge what they shared, and ask for the NEXT most important missing detail. Be conversational and friendly. Ask only ONE question at a time.`;

		const chat = model.startChat({
			history: [],
			generationConfig: {
				maxOutputTokens: 1000,
			},
		});

		const result = await chat.sendMessage(contextPrompt);
		const aiResponse = result.response.text();

		// Extract data from initial message
		const extractedData = await this.extractDataFromMessage(initialMessage, apiKey);

		// Merge with empty template
		const cvData = this.mergeWithTemplate(extractedData);

		// Save chat session
		const chatSession = await ChatSession.create({
			user_id: userId,
			session_id: sessionId,
			doc_type: docType,
			status: 'active',
			conversation_history: [
				{
					role: 'user',
					parts: [{ text: initialMessage }],
					timestamp: new Date(),
				},
				{
					role: 'model',
					parts: [{ text: aiResponse }],
					timestamp: new Date(),
				},
			],
			current_cv_data: cvData,
			fields_collected: this.getCollectedFields(cvData),
			next_field_to_ask: null,
		});

		// ✅ ADD THESE LINES - Cache the chat instance
		const cacheKey = `${userId}-${sessionId}`;
		this.activeChats.set(cacheKey, {
			chat: chat,
			lastAccessed: Date.now(),
			userId: userId,
			sessionId: sessionId,
		});

		return {
			session_id: sessionId,
			message: aiResponse,
			cv_data: cvData,
			progress: this.calculateProgress(chatSession.fields_collected),
			is_complete: false,
		};
	}

	/**
	 * Continue chat conversation
	 */
	static async continueChat(userId, sessionId, userMessage, apiKey) {
		const cacheKey = `${userId}-${sessionId}`;

		// ✅ CHECK CACHE FIRST
		let cachedChat = this.activeChats.get(cacheKey);

		const chatSession = await ChatSession.findOne({
			user_id: userId,
			session_id: sessionId,
			status: 'active',
		});

		if (!chatSession) {
			throw new Error('Chat session not found or expired');
		}

		// ✅ RECREATE CHAT FROM HISTORY IF NOT IN CACHE
		if (!cachedChat) {
			console.log('⚠️ Chat not in cache, recreating from history for session:', sessionId);

			// Limit to last 10 messages to avoid token limits
			const recentHistory = chatSession.conversation_history.slice(-10);

			const geminiHistory = recentHistory.map((msg) => ({
				role: msg.role,
				parts: [{ text: msg.parts[0].text }],
			}));

			const genAI = new GoogleGenerativeAI(apiKey);
			const model = genAI.getGenerativeModel({
				model: 'gemini-2.0-flash',
				generationConfig: {
					temperature: 0.7,
					maxOutputTokens: 1000,
				},
			});

			const chat = model.startChat({
				history: geminiHistory,
				generationConfig: {
					maxOutputTokens: 1000,
				},
			});

			cachedChat = {
				chat: chat,
				lastAccessed: Date.now(),
				userId: userId,
				sessionId: sessionId,
			};
			this.activeChats.set(cacheKey, cachedChat);
		} else {
			console.log('✅ Using cached chat for session:', sessionId);
		}

		// ✅ USE CACHED CHAT INSTANCE
		const chat = cachedChat.chat;

		// Extract data from user message
		const newData = await this.extractDataFromMessage(userMessage, apiKey);

		// Merge new data with existing
		chatSession.current_cv_data = this.deepMerge(chatSession.current_cv_data, newData);

		// Update fields collected
		chatSession.fields_collected = this.getCollectedFields(chatSession.current_cv_data);

		// Add user message to history
		chatSession.conversation_history.push({
			role: 'user',
			parts: [{ text: userMessage }],
			timestamp: new Date(),
		});

		// Determine what to ask next
		const missingFields = this.getMissingFields(chatSession.fields_collected);
		const progress = this.calculateProgress(chatSession.fields_collected);

		let aiPrompt;
		if (missingFields.length === 0 || progress >= 80) {
			aiPrompt = `Great! I have substantial information about your ${chatSession.doc_type}. Let me acknowledge what you just shared and ask if there's anything else you'd like to add or if you're ready to finalize.`;

			// ✅ DON'T set status to 'completed' yet
			// ✅ DON'T remove from cache yet
			//chatSession.status = 'completed';

			// ✅ REMOVE FROM CACHE WHEN COMPLETED
			//this.activeChats.delete(cacheKey);
			//console.log('🏁 Session completed, removed from cache:', sessionId);
		} else {
			const nextField = missingFields[0];
			aiPrompt = `Acknowledge the user's previous response positively, then ${this.getFollowUpQuestion(
				nextField,
				chatSession.current_cv_data,
			)}`;
		}

		// ✅ USE CACHED CHAT TO SEND MESSAGE
		const result = await chat.sendMessage(aiPrompt);
		const aiResponse = result.response.text();

		// Add AI response to history
		chatSession.conversation_history.push({
			role: 'model',
			parts: [{ text: aiResponse }],
			timestamp: new Date(),
		});

		await chatSession.save();

		// ✅ UPDATE LAST ACCESSED TIME
		if (this.activeChats.has(cacheKey)) {
			cachedChat.lastAccessed = Date.now();
			this.activeChats.set(cacheKey, cachedChat);
		}

		return {
			session_id: sessionId,
			message: aiResponse,
			cv_data: chatSession.current_cv_data,
			progress: progress,
			is_complete: false,
			fields_collected: chatSession.fields_collected,
			missing_fields: missingFields,
		};
	}

	/**
	 * Extract structured data from user message using AI
	 */
	static async extractDataFromMessage(message, apiKey) {
		const genAI = new GoogleGenerativeAI(apiKey);
		const model = genAI.getGenerativeModel({
			model: 'gemini-2.0-flash-lite',
			generationConfig: {
				temperature: 0.1,
				topP: 1,
				topK: 1,
			},
		});

		const prompt = `You are a data extraction expert. Extract ALL relevant CV information from the user's message and return it as JSON.

User message: "${message}"

Rules:
1. Extract EVERY piece of information mentioned
2. For dates, use MM/YYYY format or "Present" for current
3. Split descriptions into bullet points
4. Categorize skills appropriately
5. If info is missing, use empty string "" or empty array []
6. Return ONLY valid JSON, no markdown, no explanation

Return this EXACT structure (fill only what you can extract):
{
  "personal_info": {
    "full_name": "",
    "title": "",
    "phone": "",
    "email": "",
    "linkedin": "",
    "website": "",
    "location": ""
  },
  "summary": "",
  "experience": [
    {
      "title": "",
      "company": "",
      "location": "",
      "start_date": "",
      "end_date": "",
      "description_bullets": []
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "field_of_study": "",
      "graduation_date": "",
      "details": ""
    }
  ],
  "skills": {
    "core_competencies": [],
    "software_proficiency": [],
    "language_fluency": [],
    "certifications": []
  },
  "key_projects_achievements": [
    {
      "name": "",
      "description": "",
      "key_areas_used": []
    }
  ],
  "awards_and_recognitions": []
}

Extract and return JSON now:`;

		try {
			const result = await model.generateContent(prompt);
			let responseText = result.response.text().trim();

			// Clean up response
			//responseText = responseText.replace(/``````\n?/g, '').trim();
			responseText = responseText
				.replace(/```json/gi, '') // Remove ```
				.replace(/```/g, '') // Remove ```
				.replace(/`/g, '') // Remove remaining backticks
				.trim();

			console.log('🔍 Extraction attempt for:', message.substring(0, 50) + '...');
			console.log('📝 Raw AI response:', responseText.substring(0, 200) + '...');

			const extracted = JSON.parse(responseText);
			console.log('✅ Extracted data:', JSON.stringify(extracted, null, 2));

			return this.mergeWithTemplate(extracted);
		} catch (error) {
			console.error('❌ Error extracting data:', error.message);
			console.error('Message was:', message);
			return { ...this.EMPTY_CV_TEMPLATE };
		}
	}

	/**
	 * Merge extracted data with empty template
	 */
	static mergeWithTemplate(data) {
		const result = JSON.parse(JSON.stringify(this.EMPTY_CV_TEMPLATE));

		if (!data) return result;

		// Merge personal_info
		if (data.personal_info) {
			result.personal_info = { ...result.personal_info, ...data.personal_info };
		}

		// Merge summary
		if (data.summary) {
			result.summary = data.summary;
		}

		// Merge arrays (experience, education, etc.)
		if (data.experience && Array.isArray(data.experience)) {
			result.experience = data.experience.map((exp) => ({
				title: exp.title || '',
				company: exp.company || '',
				location: exp.location || '',
				start_date: exp.start_date || '',
				end_date: exp.end_date || '',
				description_bullets: exp.description_bullets || [],
			}));
		}

		if (data.education && Array.isArray(data.education)) {
			result.education = data.education.map((edu) => ({
				institution: edu.institution || '',
				degree: edu.degree || '',
				field_of_study: edu.field_of_study || '',
				graduation_date: edu.graduation_date || '',
				details: edu.details || '',
			}));
		}

		if (data.skills) {
			result.skills = {
				core_competencies: data.skills.core_competencies || [],
				software_proficiency: data.skills.software_proficiency || [],
				language_fluency: data.skills.language_fluency || [],
				certifications: data.skills.certifications || [],
			};
		}

		if (data.key_projects_achievements && Array.isArray(data.key_projects_achievements)) {
			result.key_projects_achievements = data.key_projects_achievements.map((proj) => ({
				name: proj.name || '',
				description: proj.description || '',
				key_areas_used: proj.key_areas_used || [],
			}));
		}

		if (data.awards_and_recognitions && Array.isArray(data.awards_and_recognitions)) {
			result.awards_and_recognitions = data.awards_and_recognitions;
		}

		return result;
	}

	/**
	 * Deep merge two CV data objects
	 */
	static deepMerge(existing, newData) {
		const result = JSON.parse(JSON.stringify(existing));

		// Merge personal_info
		if (newData.personal_info) {
			Object.keys(newData.personal_info).forEach((key) => {
				if (newData.personal_info[key]) {
					result.personal_info[key] = newData.personal_info[key];
				}
			});
		}

		// Merge summary
		if (newData.summary) {
			result.summary = newData.summary;
		}

		// Merge experience (append new or update existing)
		if (newData.experience && newData.experience.length > 0) {
			newData.experience.forEach((newExp) => {
				if (newExp.title || newExp.company) {
					const existingIndex = result.experience.findIndex(
						(e) => e.company === newExp.company && e.title === newExp.title,
					);

					if (existingIndex >= 0) {
						result.experience[existingIndex] = {
							...result.experience[existingIndex],
							...newExp,
						};
					} else {
						result.experience.push(newExp);
					}
				}
			});
		}

		// Merge education
		if (newData.education && newData.education.length > 0) {
			newData.education.forEach((newEdu) => {
				if (newEdu.institution || newEdu.degree) {
					const existingIndex = result.education.findIndex(
						(e) => e.institution === newEdu.institution && e.degree === newEdu.degree,
					);

					if (existingIndex >= 0) {
						result.education[existingIndex] = {
							...result.education[existingIndex],
							...newEdu,
						};
					} else {
						result.education.push(newEdu);
					}
				}
			});
		}

		// Merge skills (combine arrays, remove duplicates)
		if (newData.skills) {
			Object.keys(newData.skills).forEach((skillType) => {
				if (Array.isArray(newData.skills[skillType])) {
					result.skills[skillType] = [
						...new Set([...result.skills[skillType], ...newData.skills[skillType]]),
					].filter((s) => s);
				}
			});
		}

		// Merge projects
		if (newData.key_projects_achievements && newData.key_projects_achievements.length > 0) {
			newData.key_projects_achievements.forEach((newProj) => {
				if (newProj.name) {
					const existingIndex = result.key_projects_achievements.findIndex(
						(p) => p.name === newProj.name,
					);

					if (existingIndex >= 0) {
						result.key_projects_achievements[existingIndex] = {
							...result.key_projects_achievements[existingIndex],
							...newProj,
						};
					} else {
						result.key_projects_achievements.push(newProj);
					}
				}
			});
		}

		// Merge awards
		if (newData.awards_and_recognitions && newData.awards_and_recognitions.length > 0) {
			result.awards_and_recognitions = [
				...new Set([...result.awards_and_recognitions, ...newData.awards_and_recognitions]),
			].filter((a) => a);
		}

		return result;
	}

	/**
	 * Get collected fields (non-empty sections)
	 */
	static getCollectedFields(cvData) {
		const fields = [];

		// Check personal_info
		if (Object.values(cvData.personal_info).some((v) => v)) {
			fields.push('personal_info');
		}

		// Check summary
		if (cvData.summary) {
			fields.push('summary');
		}

		// Check experience
		if (cvData.experience.length > 0) {
			fields.push('experience');
		}

		// Check education
		if (cvData.education.length > 0) {
			fields.push('education');
		}

		// Check skills
		if (Object.values(cvData.skills).some((arr) => arr.length > 0)) {
			fields.push('skills');
		}

		// Check projects
		if (cvData.key_projects_achievements.length > 0) {
			fields.push('key_projects_achievements');
		}

		// Check awards
		if (cvData.awards_and_recognitions.length > 0) {
			fields.push('awards_and_recognitions');
		}

		return fields;
	}

	/**
	 * Get system instruction
	 */
	static getSystemInstruction(docType) {
		return `You are a professional CV writing assistant. Your job is to help users create a comprehensive CV by asking them questions ONE AT A TIME.

Be conversational, friendly, and encouraging. After each user response:
1. Acknowledge their input positively and specifically
2. Ask for the NEXT piece of information needed
3. Provide examples if helpful
4. Never ask for multiple things at once

Information to collect systematically:
- Personal info (full name, professional title, contact details)
- Professional summary (2-3 sentences about career highlights)
- Work experience (roles, companies, dates, key achievements as bullet points)
- Education (degrees, institutions, fields of study, graduation dates)
- Skills (core competencies, software proficiency, languages, certifications)
- Key projects (names, descriptions, technologies/skills used)
- Awards and recognitions

Be natural and conversational. Don't ask for things the user already provided.`;
	}

	/**
	 * Get missing fields
	 */
	static getMissingFields(collectedFields) {
		return this.CV_FIELDS.filter((field) => !collectedFields.includes(field));
	}

	/**
	 * Calculate progress percentage
	 */
	static calculateProgress(collectedFields) {
		const totalFields = this.CV_FIELDS.length;
		const collected = collectedFields.length;
		return Math.round((collected / totalFields) * 100);
	}

	/**
	 * Generate follow-up question for next field
	 */
	static getFollowUpQuestion(field, currentData) {
		const questions = {
			personal_info:
				'ask for their full name, professional title, and contact information (email, phone, location, LinkedIn profile if they have one).',
			summary:
				"ask them to describe their professional background in 2-3 sentences - what they do, their experience level, and what they're looking for.",
			experience:
				'ask about their work history. Request details about their most recent or current position: job title, company name, location, employment dates (start and end), and 2-3 key achievements or responsibilities as bullet points.',
			education:
				'ask about their educational background - degree obtained, institution name, field of study, and graduation date.',
			skills:
				'ask about their skills. What are their core competencies? What software, tools, or technologies are they proficient in? Any languages they speak? Professional certifications?',
			key_projects_achievements:
				'ask if they have any notable projects or achievements to highlight. What was the project, what did they accomplish, and what skills or technologies did they use?',
			awards_and_recognitions:
				'ask if they have received any awards, honors, or professional recognitions worth mentioning.',
		};

		return questions[field] || `ask about ${field.replace(/_/g, ' ')}.`;
	}

	/**
	 * Get chat session
	 */
	static async getChatSession(userId, sessionId) {
		return await ChatSession.findOne({
			user_id: userId,
			session_id: sessionId,
		});
	}

	/**
	 * Get user's active sessions
	 */
	static async getUserActiveSessions(userId) {
		return await ChatSession.find({
			user_id: userId,
			status: 'active',
		}).sort({ updated_at: -1 });
	}

	static cleanupExpiredChats() {
		const now = Date.now();
		const expirationTime = 30 * 60 * 1000; // 30 minutes

		for (const [key, data] of this.activeChats.entries()) {
			if (now - data.lastAccessed > expirationTime) {
				console.log('🧹 Cleaning up expired chat session:', key);
				this.activeChats.delete(key);
			}
		}

		console.log(`📊 Active chats in cache: ${this.activeChats.size}`);
	}
}

setInterval(() => {
	AIChatService.cleanupExpiredChats();
}, 10 * 60 * 1000);
