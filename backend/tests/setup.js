// backend/tests/setup.js

// This file runs before all tests and sets up the necessary environment variables
// to ensure that the application configuration can load correctly without
// relying on a .env file, which is ideal for testing and CI/CD environments.

process.env.ENCRYPTION_KEY = 'a'.repeat(64); // A valid 32-byte hex string
process.env.JWT_SECRET = 'a-super-secret-key-for-testing-only-12345';
process.env.JWT_EXPIRES_IN = '1m';
process.env.JWT_REFRESH_EXPIRES_IN = '5m';
