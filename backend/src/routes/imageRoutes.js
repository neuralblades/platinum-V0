const express = require('express');
const router = express.Router();
const { getWebpImage } = require('../controllers/imageController');

// Route to get WebP version of an image
// This will match paths like /api/images/webp/property-123.jpg
router.get('/webp/:imagePath', getWebpImage);

// Route to handle subdirectory paths
// This will match paths like /api/images/webp/blog/blog-123.jpg
router.get('/webp/:subdir/:imagePath', (req, res) => {
  // Combine subdir and imagePath
  req.params.imagePath = `${req.params.subdir}/${req.params.imagePath}`;
  getWebpImage(req, res);
});

module.exports = router;
