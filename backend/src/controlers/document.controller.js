// src/controllers/document.controller.js
import { DocumentService } from '../services/document.service.js';
import { GeminiService } from '../services/gemini.service.js';
import { decryptAPIKey } from '../utils/encryption.js';
export const createDocument = async (req, res, next) => {
    try {
        const document = await DocumentService.createDocument(req.body, req.user);
        res.status(201).json(document);
    } catch (error) {
        next(error);
    }
};
export const getDocuments = async (req, res, next) => {
    try {
        const { doc_type } = req.query;
        const documents = await DocumentService.getUserDocuments(req.user.id, doc_type);
        res.json(documents);
    } catch (error) {
        next(error);
    }
};
export const getDocument = async (req, res, next) => {
    try {
        const document = await DocumentService.getDocumentDetail(
            req.params.id,
            req.user.id
        );
        res.json(document);
    } catch (error) {
        next(error);
    }
};
export const updateDocument = async (req, res, next) => {
    try {
        const document = await DocumentService.updateDocument(
            req.params.id,
            req.body,
            req.user.id
        );
        res.json(document);
    } catch (error) {
        next(error);
    }
};
export const deleteDocument = async (req, res, next) => {
    try {
        await DocumentService.deleteDocument(req.params.id, req.user.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
export const generateContent = async (req, res, next) => {
    try {
        if (!req.user.gemini_api_key_encrypted) {
            return res.status(400).json({ error: 'Gemini API key not set' });
        }
        const apiKey = decryptAPIKey(req.user.gemini_api_key_encrypted);
        const content = await GeminiService.generateContent(
            apiKey,
            req.body.user_data,
            req.body.doc_type
        );
        res.json({ content });
    } catch (error) {
        next(error);
    }
};