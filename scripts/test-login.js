// Script to test login functionality
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

async function testLogin() {
    try {
        console.log('🔍 Testing login functionality...\n');
        
        // 1. Check database connection
        console.log('1. Testing database connection...');
        await pool.query('SELECT 1');
        console.log('   ✅ Database connection OK\n');
        
        // 2. Check if users table exists
        console.log('2. Checking users table...');
        const usersTable = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'users'
            );
        `);
        if (usersTable.rows[0].exists) {
            console.log('   ✅ Users table exists\n');
        } else {
            console.log('   ❌ Users table does not exist!\n');
            process.exit(1);
        }
        
        // 3. Check if sessions table exists
        console.log('3. Checking sessions table...');
        const sessionsTable = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'session'
            );
        `);
        if (sessionsTable.rows[0].exists) {
            console.log('   ✅ Sessions table exists\n');
        } else {
            console.log('   ⚠️  Sessions table does not exist (will be created on first use)\n');
        }
        
        // 4. Check if there are any users
        console.log('4. Checking users...');
        const users = await pool.query('SELECT id, username, role FROM users');
        if (users.rows.length > 0) {
            console.log(`   ✅ Found ${users.rows.length} user(s):`);
            users.rows.forEach(user => {
                console.log(`      - ${user.username} (${user.role})`);
            });
            console.log('');
        } else {
            console.log('   ❌ No users found!');
            console.log('   💡 Run: node scripts/create-admin.js\n');
            process.exit(1);
        }
        
        // 5. Test auth queries
        console.log('5. Testing auth queries...');
        const authQueries = require('../db/auth-queries');
        const testUser = await authQueries.getUserByUsername(users.rows[0].username);
        if (testUser) {
            console.log(`   ✅ Auth queries work (found user: ${testUser.username})\n`);
        } else {
            console.log('   ❌ Auth queries failed!\n');
            process.exit(1);
        }
        
        console.log('✅ All tests passed!');
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
        await pool.end();
        process.exit(1);
    }
}

testLogin();

