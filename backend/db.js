/** Responsible for managing (open/close) the database connection */
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

console.log('Connection string: ' + connectionString);
const pool = new Pool({
	connectionString: connectionString,
	ssl: false,
});

pool.on('error', (err, client) => {
	console.error('Unexpected error on idle client', err);
	process.exit(-1);
});

module.exports = { pool };
