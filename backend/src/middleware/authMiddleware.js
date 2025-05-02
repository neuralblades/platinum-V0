const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Protect routes - Authentication
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');

      // Get user from token
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!req.user) {
        console.log('User not found for token');
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found',
        });
      }
      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
        error: error.message
      });
    }
  } else {
    console.log('No authorization header or not Bearer format');
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token',
    });
  }
};

// Admin middleware
const admin = (req, res, next) => {

  if (req.user && req.user.role === 'admin') {
    next();
  } else if (!req.user) {
    console.log('Admin check failed - No user object');
    res.status(403).json({
      success: false,
      message: 'Not authorized as an admin - User not authenticated',
    });
  } else {
    console.log('Admin check failed - User role:', req.user.role);
    res.status(403).json({
      success: false,
      message: `Not authorized as an admin - Current role: ${req.user.role}`,
    });
  }
};

// Agent middleware
const agent = (req, res, next) => {
  if (req.user && (req.user.role === 'agent' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized as an agent',
    });
  }
};

module.exports = { protect, admin, agent };
