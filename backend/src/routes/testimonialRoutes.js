const express = require('express');
const router = express.Router();
const {
  getTestimonials,
  getAllTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} = require('../controllers/testimonialController');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `testimonial-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  },
});

// Public routes
router.get('/', getTestimonials);

// Protected routes
router.get('/admin', protect, admin, getAllTestimonials);
router.get('/:id', protect, admin, getTestimonialById);
router.post('/', protect, admin, upload.single('image'), createTestimonial);
router.put('/:id', protect, admin, upload.single('image'), updateTestimonial);
router.delete('/:id', protect, admin, deleteTestimonial);

module.exports = router;
