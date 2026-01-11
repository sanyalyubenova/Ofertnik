// Setup Neon PostgreSQL database and migrate data
// This script does both: creates tables and migrates data from JSON files
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file if it exists
try {
    require('dotenv').config();
} catch (e) {
    // dotenv not available or .env doesn't exist
}

// Use DATABASE_URL from environment (from Netlify claim or .env file)
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ Error: DATABASE_URL environment variable is not set');
    console.error('');
    console.error('To get DATABASE_URL from Netlify:');
    console.error('1. Go to Netlify Dashboard → Your site → Site settings → Environment variables');
    console.error('2. Find DATABASE_URL and copy its value');
    console.error('3. Open .env file in project root');
    console.error('4. Uncomment and update: DATABASE_URL=your_connection_string_here');
    console.error('');
    console.error('Then run this script again.');
    process.exit(1);
}

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

const TARIFFS_DIR = path.join(__dirname, '..', 'data', 'admin-tariffs');

// Insurer name mappings (from filename to display name)
const insurerNames = {
    'allianz': 'Allianz',
    'armeec': 'Армеец',
    'bul-ins': 'Българска застрахователна индустрия',
    'bulstrad': 'Булстрад',
    'dzi': 'ДЗИ',
    'generali': 'Generali',
    'grupama': 'Груп АМА',
    'unika': 'Уника'
};

async function setupAndMigrate() {
    const client = await pool.connect();
    
    try {
        console.log('📦 Setting up Neon PostgreSQL database...\n');
        
        await client.query('BEGIN');
        
        // Step 1: Read and execute schema.sql
        console.log('1. Creating tables and schema...');
        const schemaSQL = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
        
        // Execute schema SQL - execute the entire file at once
        // PostgreSQL can handle multiple statements in a single query
        try {
            await client.query(schemaSQL);
            console.log('   ✅ Schema created successfully\n');
        } catch (error) {
            // Some statements might fail if they already exist (CREATE IF NOT EXISTS handles this)
            // But we still need to check if tables were created
            if (error.code === '42P07' || error.message.includes('already exists')) {
                console.log('   ⚠️ Some objects already exist (continuing...)\n');
            } else {
                // If it's a more serious error, we still want to continue
                // because CREATE IF NOT EXISTS should handle most cases
                console.log('   ⚠️ Note:', error.message);
                console.log('   (Continuing anyway - CREATE IF NOT EXISTS should handle this)\n');
            }
        }
        
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
        console.log('');
        
        // Step 3: Migrate data from JSON files
        console.log('2. Migrating data from JSON files...\n');
        
        const files = fs.readdirSync(TARIFFS_DIR).filter(f => f.endsWith('.json'));
        console.log(`Found ${files.length} tariff files\n`);
        
        let insurerCount = 0;
        let cascoTariffCount = 0;
        let mtplTariffCount = 0;
        
        for (const file of files) {
            const filePath = path.join(TARIFFS_DIR, file);
            const tariffData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            
            // Extract insurer name from filename (e.g., "generali-casco.json" -> "generali")
            const insurerKey = file.split('-')[0];
            const insurerName = insurerNames[insurerKey] || insurerKey;
            
            console.log(`Processing: ${file} (${insurerName})`);
            
            // Create or get insurer
            let insurerResult = await client.query(
                'SELECT id FROM insurers WHERE name = $1',
                [insurerName]
            );
            
            let insurerId;
            if (insurerResult.rows.length === 0) {
                const insertResult = await client.query(
                    'INSERT INTO insurers (name) VALUES ($1) RETURNING id',
                    [insurerName]
                );
                insurerId = insertResult.rows[0].id;
                insurerCount++;
                console.log(`  ✅ Created insurer: ${insurerName}`);
            } else {
                insurerId = insurerResult.rows[0].id;
                console.log(`  ✓ Using existing insurer: ${insurerName}`);
            }
            
            // Migrate CASCO tariffs
            if (file.includes('casco') && tariffData.tariffs) {
                // Delete existing CASCO tariffs for this insurer
                await client.query('DELETE FROM casco_tariffs WHERE insurer_id = $1', [insurerId]);
                
                const discounts = tariffData.discounts || [];
                const surcharges = tariffData.surcharges || [];
                
                for (const tariff of tariffData.tariffs) {
                    await client.query(`
                        INSERT INTO casco_tariffs 
                        (insurer_id, vehicle_age_min, vehicle_age_max, insurance_sum_min, insurance_sum_max, tariff_rate, discounts, surcharges)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    `, [
                        insurerId,
                        tariff.fromAge !== null && tariff.fromAge !== undefined ? tariff.fromAge : null,
                        tariff.toAge !== null && tariff.toAge !== undefined ? tariff.toAge : null,
                        tariff.fromValue !== null && tariff.fromValue !== undefined ? parseFloat(tariff.fromValue) : null,
                        tariff.toValue !== null && tariff.toValue !== undefined ? parseFloat(tariff.toValue) : null,
                        (tariff.rate || 0) / 100, // Convert percentage to decimal
                        JSON.stringify(discounts),
                        JSON.stringify(surcharges)
                    ]);
                    
                    cascoTariffCount++;
                }
                console.log(`  ✅ Migrated ${tariffData.tariffs.length} CASCO tariffs`);
            }
            
            // Migrate MTPL tariffs
            if (file.includes('mtpl') && tariffData.basePremium !== undefined) {
                // Delete existing MTPL tariff for this insurer
                await client.query('DELETE FROM mtpl_tariffs WHERE insurer_id = $1', [insurerId]);
                
                const basePremium = parseFloat(tariffData.basePremium) || 0;
                const engineSizeMultiplier = tariffData.engineSizeMultiplier ? JSON.stringify(tariffData.engineSizeMultiplier) : null;
                const powerMultiplier = tariffData.powerMultiplier ? JSON.stringify(tariffData.powerMultiplier) : null;
                
                await client.query(`
                    INSERT INTO mtpl_tariffs 
                    (insurer_id, base_premium, engine_size_multiplier, power_multiplier)
                    VALUES ($1, $2, $3, $4)
                `, [insurerId, basePremium, engineSizeMultiplier, powerMultiplier]);
                
                mtplTariffCount++;
                console.log(`  ✅ Migrated MTPL tariff for ${insurerName}`);
            }
        }
        
        await client.query('COMMIT');
        
        console.log('\n✅ Setup and migration completed!');
        console.log(`   Insurers: ${insurerCount} created`);
        console.log(`   CASCO tariffs: ${cascoTariffCount} migrated`);
        console.log(`   MTPL tariffs: ${mtplTariffCount} migrated`);
        
        // Verify
        const cascoCount = await client.query('SELECT COUNT(*) as count FROM casco_tariffs');
        const mtplCount = await client.query('SELECT COUNT(*) as count FROM mtpl_tariffs');
        const insurerCountVerify = await client.query('SELECT COUNT(*) as count FROM insurers');
        
        console.log('\n📊 Database status:');
        console.log(`   Insurers: ${insurerCountVerify.rows[0].count}`);
        console.log(`   CASCO tariffs: ${cascoCount.rows[0].count}`);
        console.log(`   MTPL tariffs: ${mtplCount.rows[0].count}`);
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error:', error.message);
        console.error('Error stack:', error.stack);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

setupAndMigrate().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});

