/** Responsible for managing routes */
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bcrypt = require('bcrypt');

const MemoryStore = require('memorystore')(session);

const { pool } = require('./db');
const { error } = require('console');

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(express.json());
app.use(
	cors({
		origin: FRONTEND_URL,
		credentials: true,
	}),
);
app.use(
	session({
		secret: process.env.SESSION_SECRET || 'e3drya@wkS3Nm#U5JX',
		resave: false,
		saveUninitialized: false,
		store: new MemoryStore({
			checkPeriod: 86400000,
		}),
		cookie: {
			secure: false,
			httpOnly: true,
			sameSite: 'lax',
			// maxAge: 1000 * 60 * 60 * 24,
		},
	}),
);

/** General function for postgresql database queries */
async function dbQuery(query, params = []) {
	try {
		return await pool.query(query, params);
	} catch (err) {
		console.log('Database error: ', err);
		throw err;
	}
}

// Error handle middleware
app.use((err, req, res, next) => {
	console.error('Unexpected error: ', err.stack);

	if (res.headersSent) {
		return next(err);
	}

	res.status(err.status || 500).json({
		success: false,
		message: err.message || 'Internal Server Error',
	});
});

app.listen(PORT, async () => {
	console.log(`Server listening on port ${PORT}`);
});
