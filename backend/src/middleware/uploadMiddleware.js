const multer = require('multer');
const path = require('path');
const fs = require('fs');
const processImages = require('./imageProcessingMiddleware');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
const teamUploadsDir = path.join(uploadsDir, '/team');
const blogUploadsDir = path.join(uploadsDir, '/blog');
const propertiesUploadsDir = path.join(uploadsDir, '/properties');
const developersUploadsDir = path.join(uploadsDir, '/developers');
const cacheDir = path.join(uploadsDir, '/cache');

// Create all required directories
const directories = [
  uploadsDir,
  teamUploadsDir,
  blogUploadsDir,
  propertiesUploadsDir,
  developersUploadsDir,
  cacheDir
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine the destination folder based on the route or file type
    let uploadPath = uploadsDir;

    if (req.originalUrl.includes('/team')) {
      uploadPath = teamUploadsDir;
    } else if (req.originalUrl.includes('/blog')) {
      uploadPath = path.join(uploadsDir, '/blog');
    } else if (req.originalUrl.includes('/properties')) {
      uploadPath = path.join(uploadsDir, '/properties');
    } else if (req.originalUrl.includes('/developers')) {
      uploadPath = path.join(uploadsDir, '/developers');
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Create a unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Create multer upload instance
const multerUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Create a wrapper that processes images after upload
const createUploadMiddleware = (method) => {
  return (req, res, next) => {
    // First use multer to handle the upload
    method(req, res, (err) => {
      if (err) {
        return next(err);
      }

      // Then process the images (convert to WebP)
      const imageProcessor = processImages({
        quality: 80,
        createWebp: true
      });

      imageProcessor(req, res, next);
    });
  };
};

// Create enhanced upload methods with WebP conversion
const upload = {
  single: (fieldName) => {
    return (req, res, next) => {
      multerUpload.single(fieldName)(req, res, (err) => {
        if (err) {
          return next(err);
        }

        // Process the image after upload
        const imageProcessor = processImages({
          quality: 80,
          createWebp: true
        });

        imageProcessor(req, res, next);
      });
    };
  },
  array: (fieldName, maxCount) => {
    return (req, res, next) => {
      multerUpload.array(fieldName, maxCount)(req, res, (err) => {
        if (err) {
          return next(err);
        }

        // Process the images after upload
        const imageProcessor = processImages({
          quality: 80,
          createWebp: true
        });

        imageProcessor(req, res, next);
      });
    };
  },
  fields: (fields) => {
    return (req, res, next) => {
      multerUpload.fields(fields)(req, res, (err) => {
        if (err) {
          return next(err);
        }

        // Process the images after upload
        const imageProcessor = processImages({
          quality: 80,
          createWebp: true
        });

        imageProcessor(req, res, next);
      });
    };
  },
  // Provide direct access to the original multer instance if needed
  multer: multerUpload
};

module.exports = upload;
