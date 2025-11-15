// src/controllers/auth.controller.js
import { User } from '../models/postgres/index.js';
import { Op } from 'sequelize';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt.js';
export const register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        // Check if user exists
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ email: email.toLowerCase() }, { username }]
            }
        });
        if (existingUser) {
            return res.status(409).json({
                error: existingUser.email === email.toLowerCase()
                    ? 'Email already registered'
                    : 'Username already taken'
            });
        }
        // Create user
        const user = await User.create({
            email: email.toLowerCase(),
            username,
            password_hash: password
        });
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);
        res.status(201).json({
            access_token: accessToken,
            refresh_token: refreshToken,
            token_type: 'bearer',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                created_at: user.created_at,
                has_gemini_api_key: !!user.gemini_api_key_encrypted
            }
        });
    } catch (error) {
        next(error);
    }
};
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({
            where: { email: email.toLowerCase() }
        });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Incorrect email or password' });
        }
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);
        res.json({
            access_token: accessToken,
            refresh_token: refreshToken,
            token_type: 'bearer',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                created_at: user.created_at,
                has_gemini_api_key: !!user.gemini_api_key_encrypted
            }
        });
    } catch (error) {
        next(error);
    }
};
export const refreshToken = async (req, res, next) => {
    try {
        const { refresh_token } = req.body;
        const decoded = verifyToken(refresh_token);
        if (decoded.type !== 'refresh') {
            return res.status(401).json({ error: 'Invalid token type' });
        }
        const user = await User.findByPk(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        const newAccessToken = generateAccessToken(user.id);
        res.json({
            access_token: newAccessToken,
            token_type: 'bearer'
        });
    } catch (error) {
        next(error);
    }
};
