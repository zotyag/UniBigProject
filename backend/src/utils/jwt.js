// src/utils/jwt.js
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
export const generateAccessToken = (userId) => {
    return jwt.sign(
        { userId, type: 'access' },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN }
    );
};
export const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId, type: 'refresh' },
        config.JWT_SECRET,
        { expiresIn: config.JWT_REFRESH_EXPIRES_IN }
    );
};
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, config.JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};