// Neon PostgreSQL Database Connection
const { Pool } = require('pg');

// Connection configuration from environment variables
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Neon connection string
    ssl: { rejectUnauthorized: false }, // Neon requires SSL
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Test connection on first connect
pool.connect()
    .then((client) => {
        console.log('✅ Connected to Neon PostgreSQL database');
        client.release();
    })
    .catch((err) => {
        console.error('❌ Failed to connect to Neon PostgreSQL database:', err.message);
    });

pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
    process.exit(-1);
});

// Helper function to execute queries
async function query(text, params) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

// Helper function to get a client from the pool for transactions
async function getClient() {
    const client = await pool.connect();
    return client;
}

module.exports = {
    pool,
    query,
    getClient,
};

