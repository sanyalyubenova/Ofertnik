// Authentication middleware

/**
 * Middleware to check if user is authenticated
 */
function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    } else {
        return res.status(401).json({ error: 'Unauthorized' });
    }
}

/**
 * Middleware to check if user is admin
 */
function requireAdmin(req, res, next) {
    if (req.session && req.session.userId && req.session.role === 'admin') {
        return next();
    } else {
        return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }
}

/**
 * Middleware to redirect to login if not authenticated (for HTML pages)
 */
function redirectToLogin(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    } else {
        return res.redirect('/login');
    }
}

/**
 * Middleware to redirect to login if not admin (for HTML pages)
 */
function redirectToLoginIfNotAdmin(req, res, next) {
    if (req.session && req.session.userId && req.session.role === 'admin') {
        return next();
    } else {
        return res.redirect('/login');
    }
}

module.exports = {
    requireAuth,
    requireAdmin,
    redirectToLogin,
    redirectToLoginIfNotAdmin
};
