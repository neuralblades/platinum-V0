const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const util = require('util');

// Convert fs functions to Promise-based
const stat = util.promisify(fs.stat);
const exists = util.promisify(fs.exists);
const mkdir = util.promisify(fs.mkdir);

// Cache directory for WebP images
const CACHE_DIR = path.join(__dirname, '../../uploads/cache');

/**
 * Ensure the cache directory exists
 */
const ensureCacheDir = async () => {
  try {
    if (!(await exists(CACHE_DIR))) {
      await mkdir(CACHE_DIR, { recursive: true });
    }
  } catch (error) {
    console.error(`Error creating cache directory: ${error.message}`);
  }
};

/**
 * Get WebP version of an image
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getWebpImage = async (req, res) => {
  try {
    // Get the image path from the request
    const imagePath = req.params.imagePath; // Use the named parameter

    if (!imagePath) {
      return res.status(400).json({
        success: false,
        message: 'Image path is required',
      });
    }

    // Construct the full path to the original image
    // First, search for the file in all subdirectories of uploads
    const searchPaths = [
      path.join(__dirname, '../../uploads', imagePath),
      path.join(__dirname, '../../uploads/properties', imagePath),
      path.join(__dirname, '../../uploads/blog', imagePath),
      path.join(__dirname, '../../uploads/team', imagePath),
      path.join(__dirname, '../../uploads/developers', imagePath)
    ];

    // Find the first path that exists
    let originalPath = null;
    for (const searchPath of searchPaths) {
      if (await exists(searchPath)) {
        originalPath = searchPath;
        break;
      }
    }

    // If no path exists, use the default path
    if (!originalPath) {
      originalPath = path.join(__dirname, '../../uploads', imagePath);
    }

    // Check if the original image exists
    if (!(await exists(originalPath))) {
      return res.status(404).json({
        success: false,
        message: 'Image not found',
      });
    }

    // Get the file extension
    const ext = path.extname(originalPath).toLowerCase();

    // Only convert image files
    const supportedFormats = ['.jpg', '.jpeg', '.png', '.gif'];
    if (!supportedFormats.includes(ext)) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported image format',
      });
    }

    // Create cache directory if it doesn't exist
    await ensureCacheDir();

    // Generate a cache path for the WebP version
    const relativePath = imagePath.replace(/^\//, ''); // Remove leading slash if present
    const cacheKey = relativePath.replace(/\//g, '_').replace(/\.(jpg|jpeg|png|gif)$/i, '');
    const webpPath = path.join(CACHE_DIR, `${cacheKey}.webp`);

    // Check if the WebP version already exists in cache
    if (await exists(webpPath)) {
      // Get file stats to set Last-Modified header
      const stats = await stat(webpPath);

      // Set cache headers
      res.setHeader('Content-Type', 'image/webp');
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
      res.setHeader('Last-Modified', stats.mtime.toUTCString());

      // Stream the WebP image from cache
      return fs.createReadStream(webpPath).pipe(res);
    }

    // Convert the image to WebP
    await sharp(originalPath)
      .webp({ quality: 80 })
      .toFile(webpPath);

    // Get file stats to set Last-Modified header
    const stats = await stat(webpPath);

    // Set cache headers
    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
    res.setHeader('Last-Modified', stats.mtime.toUTCString());

    // Stream the WebP image
    fs.createReadStream(webpPath).pipe(res);
  } catch (error) {
    console.error(`Error serving WebP image: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error processing image',
      error: error.message,
    });
  }
};

/**
 * Convert an existing image to WebP format
 * @param {string} imagePath - Path to the original image
 * @param {number} quality - WebP quality (1-100)
 * @returns {Promise<string>} Path to the WebP version
 */
const convertToWebP = async (imagePath, quality = 80) => {
  try {
    // Check if the original image exists
    if (!(await exists(imagePath))) {
      throw new Error('Original image not found');
    }

    // Create WebP version
    const webpPath = imagePath.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');

    // Skip if WebP already exists
    if (await exists(webpPath)) {
      return webpPath;
    }

    // Convert to WebP
    await sharp(imagePath)
      .webp({ quality })
      .toFile(webpPath);

    return webpPath;
  } catch (error) {
    console.error(`Error converting image to WebP: ${error.message}`);
    throw error;
  }
};

module.exports = {
  getWebpImage,
  convertToWebP,
};
