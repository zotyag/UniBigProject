// backend/src/utils/jwt.test.js
import { jest } from '@jest/globals';
import { generateAccessToken, generateRefreshToken, verifyToken } from './jwt.js';

// Mock config for deterministic tests
jest.mock('../config/config.js', () => ({
    __esModule: true,
    default: {
        JWT_SECRET: 'a-super-secret-key-for-testing-only-12345',
        JWT_EXPIRES_IN: '1m',
        JWT_REFRESH_EXPIRES_IN: '5m',
    },
}));

describe('JWT Utility', () => {
    const userId = 123;

    describe('Access Token', () => {
        it('should generate a valid access token and verify it', () => {
            const token = generateAccessToken(userId);
            expect(typeof token).toBe('string');

            const decoded = verifyToken(token);
            expect(decoded.userId).toBe(userId);
            expect(decoded.type).toBe('access');
        });
    });

    describe('Refresh Token', () => {
        it('should generate a valid refresh token and verify it', () => {
            const token = generateRefreshToken(userId);
            expect(typeof token).toBe('string');

            const decoded = verifyToken(token);
            expect(decoded.userId).toBe(userId);
            expect(decoded.type).toBe('refresh');
        });
    });

    it('should throw an error for an invalid token', () => {
        const invalidToken = 'this.is.not.a.valid.token';
        expect(() => verifyToken(invalidToken)).toThrow('Invalid or expired token');
    });
});
