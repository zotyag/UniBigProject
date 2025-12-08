// src/controllers/aiChat.controller.js
import { AIChatService } from '../services/aiChat.service.js';
import { decryptAPIKey } from '../utils/encryption.js';

export const startChat = async (req, res, next) => {
    try {
        const { initial_message, doc_type, existing_doc_id } = req.body;

        if (!req.user.gemini_api_key_encrypted) {
            return res.status(400).json({
                error: 'Gemini API key not set. Please set your API key first.'
            });
        }

        const apiKey = decryptAPIKey(req.user.gemini_api_key_encrypted);

        const result = await AIChatService.startChatSession(
            req.user.id,
            initial_message,
            doc_type,
            apiKey,
            existing_doc_id
        );

        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

export const sendMessage = async (req, res, next) => {
    try {
        const { session_id, message } = req.body;

        if (!req.user.gemini_api_key_encrypted) {
            return res.status(400).json({
                error: 'Gemini API key not set'
            });
        }

        const apiKey = decryptAPIKey(req.user.gemini_api_key_encrypted);

        const result = await AIChatService.continueChat(
            req.user.id,
            session_id,
            message,
            apiKey
        );

        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const getChatSession = async (req, res, next) => {
    try {
        const { session_id } = req.params;

        const session = await AIChatService.getChatSession(
            req.user.id,
            session_id
        );

        if (!session) {
            return res.status(404).json({ error: 'Chat session not found' });
        }

        res.json({
            session_id: session.session_id,
            doc_type: session.doc_type,
            status: session.status,
            conversation_history: session.conversation_history,
            current_cv_data: session.current_cv_data,
            progress: AIChatService.calculateProgress(session.fields_collected),
            fields_collected: session.fields_collected,
            created_at: session.created_at,
            updated_at: session.updated_at
        });
    } catch (error) {
        next(error);
    }
};

export const getUserSessions = async (req, res, next) => {
    try {
        const sessions = await AIChatService.getUserActiveSessions(req.user.id);

        res.json({
            sessions: sessions.map(s => ({
                session_id: s.session_id,
                doc_type: s.doc_type,
                status: s.status,
                progress: AIChatService.calculateProgress(s.fields_collected),
                updated_at: s.updated_at
            }))
        });
    } catch (error) {
        next(error);
    }
};

// src/controllers/aiChat.controller.js - Update finalizeChatCV
export const finalizeChatCV = async (req, res, next) => {
    try {
        const { session_id } = req.params;
        const { title, template_code } = req.body;

        const chatSession = await AIChatService.getChatSession(
            req.user.id,
            session_id
        );

        if (!chatSession) {
            return res.status(404).json({ error: 'Chat session not found' });
        }

        // Use the chat session's CV data directly
        const cvData = chatSession.current_cv_data;

        console.log('📄 Finalizing with CV data:', JSON.stringify(cvData, null, 2));

        // Import dynamically
        const { DocumentService } = await import('../services/document.service.js');

        // Create document - pass the CV data as content_json
        // This will bypass AI regeneration
        const document = await DocumentService.createDocument(
            {
                doc_type: chatSession.doc_type,
                title: title || `My ${chatSession.doc_type}`,
                template_code: template_code || 'default',
                content_json: cvData  // Use collected data, bypass AI regeneration
            },
            req.user,
            null, // db - will be injected by controller
            null  // mongo_db - will be injected by controller
        );

        // Mark session as completed
        chatSession.status = 'completed';
        await chatSession.save();

        res.json({
            message: 'CV created successfully from chat session',
            document: document,
            cv_data: cvData
        });
    } catch (error) {
        next(error);
    }
};