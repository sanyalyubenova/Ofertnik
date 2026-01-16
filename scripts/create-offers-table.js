// Script to create offers table
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

async function createOffersTable() {
    try {
        console.log('📦 Creating offers table...\n');
        
        // Read schema file
        const fs = require('fs');
        const path = require('path');
        const schemaPath = path.join(__dirname, '..', 'db', 'schema-offers.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Execute schema
        await pool.query(schema);
        
        console.log('✅ Offers table created successfully!');
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
        await pool.end();
        process.exit(1);
    }
}

createOffersTable();

