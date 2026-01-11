// Script to add users table to existing database
const { Pool } = require('pg');

// Load environment variables
try {
    require('dotenv').config();
} catch (e) {
    // dotenv not available
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ Error: DATABASE_URL environment variable is not set');
    process.exit(1);
}

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function updateSchema() {
    const client = await pool.connect();
    
    try {
        console.log('📦 Adding users table to database...\n');
        
        await client.query('BEGIN');
        
        // Create users table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                email VARCHAR(255) UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Create indexes
        await client.query('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
        
        // Create trigger for updated_at
        await client.query(`
            CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
        `);
        
        await client.query('COMMIT');
        
        console.log('✅ Users table created successfully!\n');
        
        // Verify
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'users'
        `);
        
        if (result.rows.length > 0) {
            console.log('✅ Verification: users table exists');
        }
        
        client.release();
        await pool.end();
        process.exit(0);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error:', error.message);
        console.error(error.stack);
        client.release();
        await pool.end();
        process.exit(1);
    }
}

updateSchema();

