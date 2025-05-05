/**
 * Centralized error handling utility
 * Provides consistent error responses across the API
 */

/**
 * Handle API errors with consistent response format
 * @param {Error} error - The error object
 * @param {Object} res - Express response object
 * @param {string} customMessage - Optional custom message
 */
const handleApiError = (error, res, customMessage = 'Server Error') => {
  console.error('API Error:', error);
  
  // Handle specific error types
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: error.errors.map(e => ({ field: e.path, message: e.message }))
    });
  }
  
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Duplicate Entry',
      errors: error.errors.map(e => ({ field: e.path, message: e.message }))
    });
  }
  
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    const constraintTable = error.index?.split('_')[0] || 'unknown';
    return res.status(400).json({
      success: false,
      message: `Cannot perform this operation due to related ${constraintTable} records`,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
  
  // Default error response
  return res.status(500).json({
    success: false,
    message: customMessage,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

/**
 * Async handler to eliminate try-catch blocks in route handlers
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch((error) => handleApiError(error, res));

module.exports = {
  handleApiError,
  asyncHandler
};
