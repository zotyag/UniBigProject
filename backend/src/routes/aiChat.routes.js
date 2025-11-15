// src/routes/aiChat.routes.js
import express from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import * as chatController from '../controllers/aiChat.controller.js';

const router = express.Router();

// Start new chat session
router.post(
    '/start',
    authenticate,
    [
        body('initial_message').isLength({ min: 10 }).trim(),
        body('doc_type').isIn(['cv', 'cover_letter']),
        validate
    ],
    chatController.startChat
);

// Send message in existing chat
router.post(
    '/message',
    authenticate,
    [
        body('session_id').isUUID(),
        body('message').isLength({ min: 1 }).trim(),
        validate
    ],
    chatController.sendMessage
);

// Get chat session details
router.get(
    '/session/:session_id',
    authenticate,
    [
        param('session_id').isUUID(),
        validate
    ],
    chatController.getChatSession
);

// Get user's active sessions
router.get(
    '/sessions',
    authenticate,
    chatController.getUserSessions
);

// Finalize chat and create document
router.post(
    '/session/:session_id/finalize',
    authenticate,
    [
        param('session_id').isUUID(),
        body('title').optional().isLength({ min: 1, max: 200 }).trim(),
        body('template_code').optional().notEmpty(),
        validate
    ],
    chatController.finalizeChatCV
);

export default router;