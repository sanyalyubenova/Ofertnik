// Database queries for offers
const { query } = require('./connection');

/**
 * Create a new offer
 */
async function createOffer(userId, offerData) {
    const { offerNumber, commonData, offersData, insuranceTypes, title } = offerData;
    
    const result = await query(
        `INSERT INTO offers (user_id, offer_number, common_data, offers_data, insurance_types, title)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [userId, offerNumber || null, JSON.stringify(commonData), JSON.stringify(offersData), JSON.stringify(insuranceTypes), title || null]
    );
    
    return result.rows[0];
}

/**
 * Get all offers (for dashboard - latest from all users)
 */
async function getAllOffers(limit = 50) {
    const result = await query(
        `SELECT o.*, u.username, u.role
         FROM offers o
         JOIN users u ON o.user_id = u.id
         ORDER BY o.created_at DESC
         LIMIT $1`,
        [limit]
    );
    
    return result.rows.map(row => ({
        ...row,
        common_data: typeof row.common_data === 'string' ? JSON.parse(row.common_data) : row.common_data,
        offers_data: typeof row.offers_data === 'string' ? JSON.parse(row.offers_data) : row.offers_data,
        insurance_types: typeof row.insurance_types === 'string' ? JSON.parse(row.insurance_types) : row.insurance_types
    }));
}

/**
 * Get offers for a specific user
 */
async function getUserOffers(userId) {
    const result = await query(
        `SELECT *
         FROM offers
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
    );
    
    return result.rows.map(row => ({
        ...row,
        common_data: typeof row.common_data === 'string' ? JSON.parse(row.common_data) : row.common_data,
        offers_data: typeof row.offers_data === 'string' ? JSON.parse(row.offers_data) : row.offers_data,
        insurance_types: typeof row.insurance_types === 'string' ? JSON.parse(row.insurance_types) : row.insurance_types
    }));
}

/**
 * Get a single offer by ID
 */
async function getOfferById(offerId) {
    const result = await query(
        `SELECT o.*, u.username, u.role
         FROM offers o
         JOIN users u ON o.user_id = u.id
         WHERE o.id = $1`,
        [offerId]
    );
    
    if (result.rows.length === 0) {
        return null;
    }
    
    const row = result.rows[0];
    return {
        ...row,
        common_data: typeof row.common_data === 'string' ? JSON.parse(row.common_data) : row.common_data,
        offers_data: typeof row.offers_data === 'string' ? JSON.parse(row.offers_data) : row.offers_data,
        insurance_types: typeof row.insurance_types === 'string' ? JSON.parse(row.insurance_types) : row.insurance_types
    };
}

/**
 * Update an offer
 */
async function updateOffer(offerId, userId, offerData) {
    const { offerNumber, commonData, offersData, insuranceTypes, title } = offerData;
    
    const result = await query(
        `UPDATE offers
         SET offer_number = $3,
             common_data = $4,
             offers_data = $5,
             insurance_types = $6,
             title = $7,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [offerId, userId, offerNumber || null, JSON.stringify(commonData), JSON.stringify(offersData), JSON.stringify(insuranceTypes), title || null]
    );
    
    if (result.rows.length === 0) {
        return null;
    }
    
    const row = result.rows[0];
    return {
        ...row,
        common_data: typeof row.common_data === 'string' ? JSON.parse(row.common_data) : row.common_data,
        offers_data: typeof row.offers_data === 'string' ? JSON.parse(row.offers_data) : row.offers_data,
        insurance_types: typeof row.insurance_types === 'string' ? JSON.parse(row.insurance_types) : row.insurance_types
    };
}

/**
 * Delete an offer
 */
async function deleteOffer(offerId, userId) {
    const result = await query(
        `DELETE FROM offers
         WHERE id = $1 AND user_id = $2
         RETURNING id`,
        [offerId, userId]
    );
    
    return result.rows.length > 0;
}

module.exports = {
    createOffer,
    getAllOffers,
    getUserOffers,
    getOfferById,
    updateOffer,
    deleteOffer
};

