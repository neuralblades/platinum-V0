const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const util = require('util');

// Convert fs.stat to Promise-based
const stat = util.promisify(fs.stat);
const mkdir = util.promisify(fs.mkdir);
const exists = util.promisify(fs.exists);

/**
 * Middleware to process uploaded images and create WebP versions
 * @param {Object} options - Configuration options
 * @param {string} options.quality - WebP quality (1-100)
 * @param {boolean} options.createWebp - Whether to create WebP versions
 * @returns {Function} Express middleware
 */
const processImages = (options = {}) => {
  const {
    quality = 80,
    createWebp = true,
  } = options;

  // Create cache directory if it doesn't exist
  const ensureCacheDir = async (dirPath) => {
    try {
      if (!(await exists(dirPath))) {
        await mkdir(dirPath, { recursive: true });
      }
    } catch (error) {
      console.error(`Error creating cache directory: ${error.message}`);
    }
  };

  // Process a single file
  const processFile = async (file) => {
    if (!file) return;

    try {
      // Only process image files
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
      const ext = path.extname(file.path).toLowerCase();
      
      if (!imageExtensions.includes(ext)) {
        return;
      }

      // Create WebP version
      if (createWebp) {
        const webpPath = file.path.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');
        
        // Skip if WebP already exists
        if (await exists(webpPath)) {
          return;
        }

        // Create WebP version
        await sharp(file.path)
          .webp({ quality })
          .toFile(webpPath);
        
        console.log(`Created WebP version: ${webpPath}`);
      }
    } catch (error) {
      console.error(`Error processing image: ${error.message}`);
    }
  };

  // Middleware function
  return async (req, res, next) => {
    // Skip if no files were uploaded
    if (!req.file && !req.files) {
      return next();
    }

    try {
      // Ensure the uploads directory exists
      const uploadsDir = path.join(__dirname, '../../uploads');
      await ensureCacheDir(uploadsDir);

      // Process single file upload
      if (req.file) {
        await processFile(req.file);
      }

      // Process multiple file uploads
      if (req.files) {
        // Handle array of files
        if (Array.isArray(req.files)) {
          for (const file of req.files) {
            await processFile(file);
          }
        } 
        // Handle object with file arrays (multer fields)
        else {
          for (const fieldName in req.files) {
            for (const file of req.files[fieldName]) {
              await processFile(file);
            }
          }
        }
      }

      next();
    } catch (error) {
      console.error(`Image processing error: ${error.message}`);
      next();
    }
  };
};

module.exports = processImages;
