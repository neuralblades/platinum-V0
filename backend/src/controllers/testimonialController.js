const { Testimonial } = require('../models');
const fs = require('fs');
const path = require('path');

// @desc    Get all testimonials
// @route   GET /api/testimonials
// @access  Public
const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.findAll({
      where: { isActive: true },
      order: [
        ['order', 'ASC'],
        ['createdAt', 'DESC']
      ],
    });

    res.json({
      success: true,
      testimonials,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Get all testimonials (including inactive) for admin
// @route   GET /api/testimonials/admin
// @access  Private/Admin
const getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.findAll({
      order: [
        ['order', 'ASC'],
        ['createdAt', 'DESC']
      ],
    });

    res.json({
      success: true,
      testimonials,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Get testimonial by ID
// @route   GET /api/testimonials/:id
// @access  Private/Admin
const getTestimonialById = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found',
      });
    }

    res.json({
      success: true,
      testimonial,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Create a new testimonial
// @route   POST /api/testimonials
// @access  Private/Admin
const createTestimonial = async (req, res) => {
  try {
    const { name, role, quote, rating, isActive, order } = req.body;

    // Process image
    let image = '';
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    // Create testimonial
    const testimonial = await Testimonial.create({
      name,
      role,
      image,
      quote,
      rating: rating || 5,
      isActive: isActive === 'true' || isActive === true,
      order: order ? parseInt(order) : 0,
    });

    res.status(201).json({
      success: true,
      testimonial,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Update a testimonial
// @route   PUT /api/testimonials/:id
// @access  Private/Admin
const updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found',
      });
    }

    const { name, role, quote, rating, isActive, order } = req.body;

    // Process image if a new one is uploaded
    let image = testimonial.image;
    if (req.file) {
      // Delete old image if it exists
      if (testimonial.image) {
        const oldImagePath = path.join(__dirname, '../..', testimonial.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      image = `/uploads/${req.file.filename}`;
    }

    // Update testimonial
    await testimonial.update({
      name: name || testimonial.name,
      role: role || testimonial.role,
      image,
      quote: quote || testimonial.quote,
      rating: rating ? parseInt(rating) : testimonial.rating,
      isActive: isActive === 'true' || isActive === true,
      order: order ? parseInt(order) : testimonial.order,
    });

    res.json({
      success: true,
      testimonial,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Delete a testimonial
// @route   DELETE /api/testimonials/:id
// @access  Private/Admin
const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found',
      });
    }

    // Delete image if it exists
    if (testimonial.image) {
      const imagePath = path.join(__dirname, '../..', testimonial.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await testimonial.destroy();

    res.json({
      success: true,
      message: 'Testimonial removed',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

module.exports = {
  getTestimonials,
  getAllTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
};
