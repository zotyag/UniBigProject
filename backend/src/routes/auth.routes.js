// src/routes/auth.routes.js
import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware.js';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

router.post(
    '/register',
    [
        body('email').isEmail().normalizeEmail(),
        body('username').isLength({ min: 3, max: 64 }).trim(),
        body('password').isLength({ min: 8, max: 128 }),
        body('password_confirm').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
        validate
    ],
    authController.register
);
router.post(
    '/login',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').notEmpty(),
        validate
    ],
    authController.login
);
router.post(
    '/refresh',
    [
        body('refresh_token').notEmpty(),
        validate
    ],
    authController.refreshToken
);
export default router;
