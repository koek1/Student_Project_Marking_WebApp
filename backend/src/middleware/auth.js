const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware to verify JWT tokens:
const authenticate = async (req, res, next) => {
    try {
        // Get token from the authorization header:
        const authHeader = req.header('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: No token provided'
            });
        }

        // Extract token from Bearer:
        const token = authHeader.substring(7);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Invalid token format'
            });
        }

        try {
            // Verify and decode the token:
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find user by ID from token:
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Account is deactivated'
                });
            }

            // Add user to request object:
            req.user = user;
            next();
        }catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid Token'
            });
        }
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json ({
            success: false,
            message: 'Server error during authentication'
        });
    }
};


// Authorization middleware to check user roles:
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Access denied: No user authenticated'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied: Required Role: ${roles.join(' or ')}`
            });
        }

        next();
    };
};


// Midlleware to check if the user is admin:
const requireAdmin = authorize('admin');

// Middleware to check if the user is judge:
const requireJudge = authorize('judge');

// Middleware to check if the user is admin or judge:
const requireAdminOrJudge = authorize('admin', 'judge');

module.exports = {
    authenticate,
    authorize,
    requireAdmin,
    requireJudge,
    requireAdminOrJudge,
};