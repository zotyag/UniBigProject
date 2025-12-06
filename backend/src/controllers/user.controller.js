// src/controllers/user.controller.js
import { User } from '../models/postgres/index.js';
import { encryptAPIKey } from '../utils/encryption.js';
import { ProfilePictureService } from '../services/profilePicture.service.js';

export const getProfilePicture = async (req, res, next) => {
	try {
		const picture = await ProfilePictureService.getProfilePicture(req.user.id);
		if (!picture) {
			return res.status(404).json({ error: 'Profile picture not found' });
		}
		res.json({
			url: picture.image_data,
		});
	} catch (error) {
		next(error);
	}
};

export const setProfilePicture = async (req, res, next) => {
	try {
		const { image_data } = req.body;
		if (!image_data) {
			return res.status(400).json({ error: 'Image data is required' });
		}
		const picture = await ProfilePictureService.setProfilePicture(req.user.id, image_data);
		res.status(201).json({
			message: 'Profile picture set successfully',
			url: picture.image_data,
		});
	} catch (error) {
		next(error);
	}
};

export const deleteProfilePicture = async (req, res, next) => {
	try {
		await ProfilePictureService.deleteProfilePicture(req.user.id);
		res.status(204).send();
	} catch (error) {
		next(error);
	}
};
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

export const changePassword = async (req, res, next) => {
    try {
        const { old_password, new_password } = req.body;

        const user = await User.findByPk(req.user.id);

        if (!user || !(await user.comparePassword(old_password))) {
            return res.status(401).json({ error: 'Incorrect old password' });
        }

        user.password_hash = new_password;
        await user.save();

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};