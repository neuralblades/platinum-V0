const express = require('express');
const router = express.Router();
const { clearCache } = require('../controllers/cacheController');
const { protect, admin } = require('../middleware/authMiddleware');

// Protected routes
router.post('/clear', clearCache);

module.exports = router;
