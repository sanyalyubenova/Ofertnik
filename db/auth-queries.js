// Authentication and user management queries
const { query } = require('./connection');
const bcrypt = require('bcryptjs');

/**
 * Get user by username
 */
async function getUserByUsername(username) {
    const result = await query(
        'SELECT * FROM users WHERE username = $1',
        [username]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Get user by email
 */
async function getUserByEmail(email) {
    const result = await query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Get user by ID
 */
async function getUserById(id) {
    const result = await query(
        'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = $1',
        [id]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Create a new user
 */
async function createUser(username, email, password, role = 'user') {
    const passwordHash = await bcrypt.hash(password, 10);
    
    const result = await query(
        'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at',
        [username, email || null, passwordHash, role]
    );
    
    return result.rows[0];
}

/**
 * Verify password
 */
async function verifyPassword(username, password) {
    const user = await getUserByUsername(username);
    if (!user) {
        return null;
    }
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
        return null;
    }
    
    // Return user without password hash
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at
    };
}

/**
 * Get all users (for admin)
 */
async function getAllUsers() {
    const result = await query(
        'SELECT id, username, email, role, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
}

/**
 * Delete user by ID
 */
async function deleteUser(userId) {
    await query('DELETE FROM users WHERE id = $1', [userId]);
}

/**
 * Update user password
 */
async function updateUserPassword(userId, newPassword) {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await query(
        'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [passwordHash, userId]
    );
}

module.exports = {
    getUserByUsername,
    getUserByEmail,
    getUserById,
    createUser,
    verifyPassword,
    getAllUsers,
    deleteUser,
    updateUserPassword
};

