// Test Neon PostgreSQL connection
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_6VYHJFZMb1eU@ep-old-glitter-ah7xsbhd-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function testConnection() {
    try {
        const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
        console.log('✅ Connection test successful!');
        console.log('Current time:', result.rows[0].current_time);
        console.log('PostgreSQL version:', result.rows[0].pg_version.split(',')[0]);
        
        // Check if tables exist
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        console.log('\n📊 Existing tables:', tables.rows.length);
        if (tables.rows.length > 0) {
            tables.rows.forEach(row => {
                console.log('  -', row.table_name);
            });
        } else {
            console.log('  (No tables found - need to run schema.sql)');
        }
        
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
        await pool.end();
        process.exit(1);
    }
}

testConnection();

