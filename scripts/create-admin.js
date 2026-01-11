// Script to create the first admin user
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

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
    try {
        console.log('Създаване на администраторски акаунт\n');
        
        const username = await question('Потребителско име: ');
        if (!username) {
            console.error('Потребителското име е задължително!');
            process.exit(1);
        }
        
        const email = await question('Имейл (опционално): ');
        const password = await question('Парола: ');
        if (!password) {
            console.error('Паролата е задължителна!');
            process.exit(1);
        }
        
        const passwordConfirm = await question('Потвърди парола: ');
        if (password !== passwordConfirm) {
            console.error('Паролите не съвпадат!');
            process.exit(1);
        }
        
        const authQueries = require('../db/auth-queries');
        
        // Check if user already exists
        const existingUser = await authQueries.getUserByUsername(username);
        if (existingUser) {
            console.error(`Потребител с име "${username}" вече съществува!`);
            process.exit(1);
        }
        
        // Create admin user
        const user = await authQueries.createUser(username, email || null, password, 'admin');
        
        console.log('\n✅ Администраторският акаунт е създаден успешно!');
        console.log(`   ID: ${user.id}`);
        console.log(`   Потребителско име: ${user.username}`);
        console.log(`   Роля: ${user.role}`);
        
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Грешка:', error.message);
        console.error(error.stack);
        await pool.end();
        process.exit(1);
    } finally {
        rl.close();
    }
}

createAdmin();

