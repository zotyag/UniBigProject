
// src/routes/document.routes.js
import express from 'express';
import { body, query } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import * as documentController from '../controllers/document.controller.js';
const router = express.Router();
router.post(
    '/',
    authenticate,
    [
        body('doc_type').isIn(['cv', 'cover_letter']),
        body('title').isLength({ min: 1, max: 200 }).trim(),
        body('template_code').notEmpty(),
        body('user_data').optional().isObject(),
        body('content_json').optional().isObject(),
        // Ensure at least one of user_data or content_json is present
        body().custom((value, { req }) => {
            if (!req.body.user_data && !req.body.content_json) {
                throw new Error('Either user_data or content_json must be provided');
            }
            return true;
        }),
        validate
    ],
    documentController.createDocument
);
router.get(
    '/',
    authenticate,
    [
        query('doc_type').optional().isIn(['cv', 'cover_letter']),
        validate
    ],
    documentController.getDocuments
);
router.get('/:id', authenticate, documentController.getDocument);
router.put(
    '/:id',
    authenticate,
    [
        body('title').optional().isLength({ min: 1, max: 200 }).trim(),
        body('content_json').optional().isObject(),
        body('state').optional().isIn(['draft', 'published']),
        validate
    ],
    documentController.updateDocument
);
router.delete('/:id', authenticate, documentController.deleteDocument);
router.post(
    '/generate-content',
    authenticate,
    [
        body('user_data').isObject(),
        body('doc_type').isIn(['cv', 'cover_letter']),
        body('template_code').notEmpty(),
        validate
    ],
    documentController.generateContent
);
export default router;