// src/controllers/user.controller.js
import { User } from '../models/postgres/index.js';
import { encryptAPIKey } from '../utils/encryption.js';
export const getCurrentUser = async (req, res, next) => {
    try {
        res.json({
            id: req.user.id,
            email: req.user.email,
            username: req.user.username,
            role: req.user.role,
            created_at: req.user.created_at,
            has_gemini_api_key: !!req.user.gemini_api_key_encrypted
        });
    } catch (error) {
        next(error);
    }
};
export const updateUser = async (req, res, next) => {
    try {
        const { username, email } = req.body;
        if (username) req.user.username = username;
        if (email) req.user.email = email.toLowerCase();
        await req.user.save();
        res.json({
            id: req.user.id,
            email: req.user.email,
            username: req.user.username,
            role: req.user.role,
            created_at: req.user.created_at,
            has_gemini_api_key: !!req.user.gemini_api_key_encrypted
        });
    } catch (error) {
        next(error);
    }
};
export const setGeminiAPIKey = async (req, res, next) => {
    try {
        const { api_key } = req.body;
        const encrypted = encryptAPIKey(api_key);
        req.user.gemini_api_key_encrypted = encrypted;
        await req.user.save();
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
export const deleteGeminiAPIKey = async (req, res, next) => {
    try {
        req.user.gemini_api_key_encrypted = null;
        await req.user.save();
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};