// Migrate data from JSON files to Neon PostgreSQL database
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_6VYHJFZMb1eU@ep-old-glitter-ah7xsbhd-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

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

async function migrateData() {
    const client = await pool.connect();
    
    try {
        console.log('📦 Migrating data from JSON files to database...\n');
        
        await client.query('BEGIN');
        
        // Get all JSON files
        const files = fs.readdirSync(TARIFFS_DIR).filter(f => f.endsWith('.json'));
        console.log(`Found ${files.length} tariff files\n`);
        
        let insurerCount = 0;
        let cascoTariffCount = 0;
        let mtplTariffCount = 0;
        let gapTariffCount = 0;
        
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
                for (const tariff of tariffData.tariffs) {
                    const vehicleAgeMin = tariff.vehicleAgeMin || null;
                    const vehicleAgeMax = tariff.vehicleAgeMax || null;
                    const insuranceSumMin = tariff.insuranceSumMin || null;
                    const insuranceSumMax = tariff.insuranceSumMax || null;
                    const tariffRate = parseFloat(tariff.tariffRate) || 0;
                    const discounts = tariff.discounts ? JSON.stringify(tariff.discounts) : null;
                    const surcharges = tariff.surcharges ? JSON.stringify(tariff.surcharges) : null;
                    
                    await client.query(`
                        INSERT INTO casco_tariffs 
                        (insurer_id, vehicle_age_min, vehicle_age_max, insurance_sum_min, insurance_sum_max, tariff_rate, discounts, surcharges)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                        ON CONFLICT (insurer_id, vehicle_age_min, vehicle_age_max, insurance_sum_min, insurance_sum_max)
                        DO UPDATE SET 
                            tariff_rate = EXCLUDED.tariff_rate,
                            discounts = EXCLUDED.discounts,
                            surcharges = EXCLUDED.surcharges
                    `, [insurerId, vehicleAgeMin, vehicleAgeMax, insuranceSumMin, insuranceSumMax, tariffRate, discounts, surcharges]);
                    
                    cascoTariffCount++;
                }
                console.log(`  ✅ Migrated ${tariffData.tariffs.length} CASCO tariffs`);
            }
            
            // Migrate MTPL tariffs
            if (file.includes('mtpl') && tariffData.basePremium) {
                const basePremium = parseFloat(tariffData.basePremium) || 0;
                const engineSizeMultiplier = tariffData.engineSizeMultiplier ? JSON.stringify(tariffData.engineSizeMultiplier) : null;
                const powerMultiplier = tariffData.powerMultiplier ? JSON.stringify(tariffData.powerMultiplier) : null;
                
                await client.query(`
                    INSERT INTO mtpl_tariffs 
                    (insurer_id, base_premium, engine_size_multiplier, power_multiplier)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (insurer_id)
                    DO UPDATE SET 
                        base_premium = EXCLUDED.base_premium,
                        engine_size_multiplier = EXCLUDED.engine_size_multiplier,
                        power_multiplier = EXCLUDED.power_multiplier
                `, [insurerId, basePremium, engineSizeMultiplier, powerMultiplier]);
                
                mtplTariffCount++;
                console.log(`  ✅ Migrated MTPL tariff for ${insurerName}`);
            }
        }
        
        await client.query('COMMIT');
        
        console.log('\n✅ Migration completed!');
        console.log(`   Insurers: ${insurerCount} created`);
        console.log(`   CASCO tariffs: ${cascoTariffCount} migrated`);
        console.log(`   MTPL tariffs: ${mtplTariffCount} migrated`);
        console.log(`   GAP tariffs: ${gapTariffCount} migrated`);
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

migrateData().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});

