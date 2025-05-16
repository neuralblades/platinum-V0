const cacheManager = require('../utils/cacheManager');

/**
 * Clear cache for a specific key or all keys
 * @route   POST /api/cache/clear
 * @access  Public (for now, can be restricted later)
 */
const clearCache = (req, res) => {
  try {
    const { key } = req.body;

    if (key) {
      // Clear specific key
      cacheManager.remove(key);
      console.log(`Cache cleared for key: ${key}`);
      return res.json({
        success: true,
        message: `Cache cleared for key: ${key}`
      });
    } else {
      // Clear all cache
      cacheManager.clear();
      console.log('All cache cleared');
      return res.json({
        success: true,
        message: 'All cache cleared'
      });
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
    return res.status(500).json({
      success: false,
      message: 'Error clearing cache',
      error: error.message
    });
  }
};

module.exports = {
  clearCache
};
