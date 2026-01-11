// Database queries for Ofertnik
const { query, getClient } = require('./connection');

/**
 * Get all insurers
 */
async function getInsurers() {
    const result = await query('SELECT * FROM insurers ORDER BY name');
    return result.rows;
}

/**
 * Get CASCO tariffs for a specific insurer
 */
async function getCascoTariffs(insurerId) {
    // Order by id to preserve the order in which tariffs were saved (user's custom order)
    const result = await query(
        'SELECT * FROM casco_tariffs WHERE insurer_id = $1 ORDER BY id',
        [insurerId]
    );
    // Parse JSONB fields
    return result.rows.map(row => ({
        ...row,
        discounts: typeof row.discounts === 'string' ? JSON.parse(row.discounts) : (row.discounts || []),
        surcharges: typeof row.surcharges === 'string' ? JSON.parse(row.surcharges) : (row.surcharges || [])
    }));
}

/**
 * Get CASCO tariff rate for specific conditions
 */
async function getCascoTariffRate(insurerId, vehicleAge, insuranceSum) {
    const result = await query(
        `SELECT tariff_rate, discounts, surcharges 
         FROM casco_tariffs 
         WHERE insurer_id = $1 
           AND (vehicle_age_min IS NULL OR vehicle_age_min <= $2)
           AND (vehicle_age_max IS NULL OR vehicle_age_max >= $2)
           AND (insurance_sum_min IS NULL OR insurance_sum_min <= $3)
           AND (insurance_sum_max IS NULL OR insurance_sum_max >= $3)
         ORDER BY vehicle_age_min DESC, insurance_sum_min DESC
         LIMIT 1`,
        [insurerId, vehicleAge, insuranceSum]
    );
    
    if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
            rate: parseFloat(row.tariff_rate) || 0,
            discounts: typeof row.discounts === 'string' ? JSON.parse(row.discounts) : (row.discounts || []),
            surcharges: typeof row.surcharges === 'string' ? JSON.parse(row.surcharges) : (row.surcharges || [])
        };
    }
    
    return null;
}

/**
 * Get all CASCO tariffs for all insurers
 */
async function getAllCascoTariffs() {
    const result = await query(`
        SELECT 
            i.name as insurer_name,
            i.id as insurer_id,
            ct.*
        FROM casco_tariffs ct
        JOIN insurers i ON ct.insurer_id = i.id
        ORDER BY i.name, ct.vehicle_age_min, ct.insurance_sum_min
    `);
    return result.rows;
}

/**
 * Get MTPL tariff for a specific insurer
 */
async function getMTPLTariff(insurerId) {
    const result = await query(
        'SELECT * FROM mtpl_tariffs WHERE insurer_id = $1',
        [insurerId]
    );
    
    if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
            basePremium: parseFloat(row.base_premium) || 0,
            engineSizeMultiplier: typeof row.engine_size_multiplier === 'string' 
                ? JSON.parse(row.engine_size_multiplier) 
                : (row.engine_size_multiplier || {}),
            powerMultiplier: typeof row.power_multiplier === 'string' 
                ? JSON.parse(row.power_multiplier) 
                : (row.power_multiplier || {})
        };
    }
    
    return null;
}

/**
 * Get all MTPL tariffs for all insurers
 */
async function getAllMTPLTariffs() {
    const result = await query(`
        SELECT 
            i.name as insurer_name,
            i.id as insurer_id,
            mt.*
        FROM mtpl_tariffs mt
        JOIN insurers i ON mt.insurer_id = i.id
        ORDER BY i.name
    `);
    return result.rows;
}

/**
 * Get insurer by name (case-insensitive partial match)
 */
async function getInsurerByName(name) {
    const result = await query(
        'SELECT * FROM insurers WHERE LOWER(name) LIKE LOWER($1) LIMIT 1',
        [`%${name}%`]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Get insurer by key (e.g., 'generali', 'allianz')
 */
async function getInsurerByKey(key) {
    const insurerNameMap = {
        'allianz': 'Allianz',
        'armeec': 'Армеец',
        'bul-ins': 'Българска застрахователна индустрия',
        'bulstrad': 'Булстрад',
        'dzi': 'ДЗИ',
        'generali': 'Generali',
        'grupama': 'Груп АМА',
        'unika': 'Уника'
    };
    
    const insurerName = insurerNameMap[key.toLowerCase()];
    if (!insurerName) return null;
    
    const result = await query(
        'SELECT * FROM insurers WHERE name = $1',
        [insurerName]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Save CASCO tariff
 */
async function saveCascoTariff(insurerId, tariff) {
    await query(`
        INSERT INTO casco_tariffs 
        (insurer_id, vehicle_age_min, vehicle_age_max, insurance_sum_min, insurance_sum_max, tariff_rate, discounts, surcharges)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (insurer_id, vehicle_age_min, vehicle_age_max, insurance_sum_min, insurance_sum_max)
        DO UPDATE SET 
            tariff_rate = EXCLUDED.tariff_rate,
            discounts = EXCLUDED.discounts,
            surcharges = EXCLUDED.surcharges
    `, [
        insurerId,
        tariff.vehicleAgeMin || null,
        tariff.vehicleAgeMax || null,
        tariff.insuranceSumMin || null,
        tariff.insuranceSumMax || null,
        tariff.tariffRate || 0,
        tariff.discounts ? JSON.stringify(tariff.discounts) : null,
        tariff.surcharges ? JSON.stringify(tariff.surcharges) : null
    ]);
}

/**
 * Save MTPL tariff
 */
async function saveMTPLTariff(insurerId, tariff) {
    await query(`
        INSERT INTO mtpl_tariffs 
        (insurer_id, base_premium, engine_size_multiplier, power_multiplier)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (insurer_id)
        DO UPDATE SET 
            base_premium = EXCLUDED.base_premium,
            engine_size_multiplier = EXCLUDED.engine_size_multiplier,
            power_multiplier = EXCLUDED.power_multiplier
    `, [
        insurerId,
        tariff.basePremium || 0,
        tariff.engineSizeMultiplier ? JSON.stringify(tariff.engineSizeMultiplier) : null,
        tariff.powerMultiplier ? JSON.stringify(tariff.powerMultiplier) : null
    ]);
}

module.exports = {
    getInsurers,
    getCascoTariffs,
    getCascoTariffRate,
    getAllCascoTariffs,
    getMTPLTariff,
    getAllMTPLTariffs,
    getInsurerByName,
    getInsurerByKey,
    saveCascoTariff,
    saveMTPLTariff
};
