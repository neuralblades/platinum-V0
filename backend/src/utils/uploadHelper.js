/**
 * Centralized file upload utility
 * Provides consistent file upload handling across the application
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Create a multer upload middleware for a specific entity
 * @param {string} entity - Entity name (e.g., 'properties', 'blog', 'developers')
 * @param {number} maxSize - Maximum file size in MB (default: 5MB)
 * @param {string[]} allowedTypes - Allowed file types (default: images only)
 * @returns {Object} - Multer upload middleware
 */
const createUploadMiddleware = (entity, maxSize = 5, allowedTypes = ['image']) => {
  // Ensure the upload directory exists
  const uploadDir = path.join(__dirname, `../../uploads/${entity}`);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  // Configure storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `${entity}-${uniqueSuffix}${ext}`);
    }
  });
  
  // Configure file filter based on allowed types
  const fileFilter = (req, file, cb) => {
    let allowed = false;
    
    if (allowedTypes.includes('image')) {
      const imageTypes = /jpeg|jpg|png|gif|webp/;
      if (
        imageTypes.test(path.extname(file.originalname).toLowerCase()) &&
        imageTypes.test(file.mimetype)
      ) {
        allowed = true;
      }
    }
    
    if (allowedTypes.includes('document')) {
      const docTypes = /pdf|doc|docx|txt|rtf/;
      if (
        docTypes.test(path.extname(file.originalname).toLowerCase()) &&
        (file.mimetype.includes('pdf') || 
         file.mimetype.includes('word') || 
         file.mimetype.includes('text'))
      ) {
        allowed = true;
      }
    }
    
    if (allowed) {
      cb(null, true);
    } else {
      cb(new Error(`Only ${allowedTypes.join(', ')} files are allowed!`));
    }
  };
  
  // Create and return the multer middleware
  return {
    single: (fieldName) => 
      multer({
        storage,
        limits: { fileSize: maxSize * 1024 * 1024 },
        fileFilter
      }).single(fieldName),
    
    array: (fieldName, maxCount = 10) => 
      multer({
        storage,
        limits: { fileSize: maxSize * 1024 * 1024 },
        fileFilter
      }).array(fieldName, maxCount),
    
    fields: (fields) => 
      multer({
        storage,
        limits: { fileSize: maxSize * 1024 * 1024 },
        fileFilter
      }).fields(fields)
  };
};

/**
 * Get the public URL for an uploaded file
 * @param {string} entity - Entity name (e.g., 'properties', 'blog')
 * @param {string} filename - Filename
 * @returns {string} - Public URL
 */
const getFileUrl = (entity, filename) => {
  if (!filename) return null;
  
  // If it's already a full URL, return as is
  if (filename.startsWith('http')) {
    return filename;
  }
  
  // If it's a relative path, construct the URL
  return `/uploads/${entity}/${path.basename(filename)}`;
};

module.exports = {
  createUploadMiddleware,
  getFileUrl
};
