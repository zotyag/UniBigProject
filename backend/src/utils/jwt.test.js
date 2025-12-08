import { generateAccessToken, generateRefreshToken, verifyToken } from './jwt.js';

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
