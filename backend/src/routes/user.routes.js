// src/routes/user.routes.js
import express from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import * as userController from '../controllers/user.controller.js';
const router = express.Router();
router.get('/me', authenticate, userController.getCurrentUser);
router.put(
    '/me',
    authenticate,
    [
        body('username').optional().isLength({ min: 3, max: 64 }).trim(),
        body('email').optional().isEmail().normalizeEmail(),
        validate
    ],
    userController.updateUser
);
router.post(
    '/me/gemini-api-key',
    authenticate,
    [
        body('api_key').isLength({ min: 10 }),
        validate
    ],
    userController.setGeminiAPIKey
);
router.delete('/me/gemini-api-key', authenticate, userController.deleteGeminiAPIKey);
export default router;