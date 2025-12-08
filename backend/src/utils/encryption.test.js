import { encryptAPIKey, decryptAPIKey } from './encryption.js';
import crypto from 'crypto';

describe('Encryption Utility', () => {
    it('should encrypt and then decrypt a string back to its original value', () => {
        const originalText = 'my-super-secret-api-key-12345';

        // Encrypt the text
        const encryptedText = encryptAPIKey(originalText);

        // Decrypt the text
        const decryptedText = decryptAPIKey(encryptedText);

        // Assertions
        expect(typeof encryptedText).toBe('string');
        expect(encryptedText).not.toBe(originalText);
        expect(decryptedText).toBe(originalText);
    });

    it('should produce a different encrypted string each time for the same input (due to random IV)', () => {
        const originalText = 'some-other-secret-key';

        const encryptedText1 = encryptAPIKey(originalText);
        const encryptedText2 = encryptAPIKey(originalText);

        expect(encryptedText1).not.toBe(encryptedText2);
    });
});
