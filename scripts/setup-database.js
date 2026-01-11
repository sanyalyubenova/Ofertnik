// Setup Neon PostgreSQL database - create tables and migrate data
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_6VYHJFZMb1eU@ep-old-glitter-ah7xsbhd-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function setupDatabase() {
    const client = await pool.connect();
    
    try {
        console.log('📦 Setting up Neon PostgreSQL database...\n');
        
        // Step 1: Read and execute schema.sql
        console.log('1. Creating tables...');
        const schemaSQL = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
        await client.query(schemaSQL);
        console.log('   ✅ Tables created successfully\n');
        
        // Step 2: Check existing tables
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        console.log('📊 Existing tables:', tables.rows.length);
        tables.rows.forEach(row => {
            console.log('   -', row.table_name);
        });
        
        console.log('\n✅ Database setup completed!');
        console.log('\nNext steps:');
        console.log('1. Migrate existing data from JSON files (if needed)');
        console.log('2. Update server.js to use database queries');
        console.log('3. Restart server: npm start');
        
    } catch (error) {
        console.error('❌ Error setting up database:', error.message);
        if (error.code === '42P07') {
            console.log('   (Table already exists - this is OK)');
        } else {
            throw error;
        }
    } finally {
        client.release();
        await pool.end();
    }
}

setupDatabase().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});

