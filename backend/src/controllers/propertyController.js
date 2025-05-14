const { Property, User, Developer } = require('../models');
const { Op } = require('sequelize');
const cacheManager = require('../utils/cacheManager');
const { handleApiError, asyncHandler } = require('../utils/errorHandler');
const { deleteUnusedImages, deleteFile } = require('../utils/fileUtils');

// @desc    Get all properties with filtering
// @route   GET /api/properties
// @access  Public
const getProperties = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 9;
  const page = Number(req.query.page) || 1;

  // Generate cache key based on query parameters
  const queryString = JSON.stringify(req.query);
  const cacheKey = `properties_${queryString}`;

  // Try to get from cache
  const cachedData = cacheManager.get(cacheKey);
  if (cachedData) {
    console.log('Serving properties from cache');
    return res.json({
      ...cachedData,
      fromCache: true
    });
  }

  // Build where clause for filtering
  const whereClause = {};

  // Filter by property type
  if (req.query.type) {
    whereClause.propertyType = req.query.type;
  }

  // Filter by status
  if (req.query.status) {
    whereClause.status = req.query.status;
  }

  // Filter by offplan status
  if (req.query.isOffplan !== undefined) {
    whereClause.isOffplan = req.query.isOffplan === 'true';
  }

  // Filter by price range
  if (req.query.minPrice || req.query.maxPrice) {
    whereClause.price = {};
    if (req.query.minPrice) {
      whereClause.price[Op.gte] = Number(req.query.minPrice);
    }
    if (req.query.maxPrice) {
      whereClause.price[Op.lte] = Number(req.query.maxPrice);
    }
  }

  // Filter by bedrooms
  if (req.query.bedrooms) {
    whereClause.bedrooms = { [Op.gte]: Number(req.query.bedrooms) };
  }

  // Filter by bathrooms
  if (req.query.bathrooms) {
    whereClause.bathrooms = { [Op.gte]: Number(req.query.bathrooms) };
  }

  // Filter by area range
  if (req.query.minArea || req.query.maxArea) {
    whereClause.area = {};
    if (req.query.minArea) {
      whereClause.area[Op.gte] = Number(req.query.minArea);
    }
    if (req.query.maxArea) {
      whereClause.area[Op.lte] = Number(req.query.maxArea);
    }
  }

  // Filter by location
  if (req.query.location) {
    whereClause.location = { [Op.like]: `%${req.query.location}%` };
  }

  // Filter by year built
  if (req.query.yearBuilt) {
    whereClause.yearBuilt = Number(req.query.yearBuilt);
  }

  // Search by keyword
  if (req.query.keyword) {
    whereClause[Op.or] = [
      { title: { [Op.like]: `%${req.query.keyword}%` } },
      { description: { [Op.like]: `%${req.query.keyword}%` } },
      { location: { [Op.like]: `%${req.query.keyword}%` } },
    ];
  }

  // Get properties with pagination and count
  const { count, rows: properties } = await Property.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: 'agent',
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'avatar'],
      },
      {
        model: Developer,
        as: 'developer',
        attributes: ['id', 'name', 'logo', 'slug'],
      },
    ],
    order: [['createdAt', 'DESC']],
    limit: pageSize,
    offset: pageSize * (page - 1),
  });

  // Prepare response data
  const responseData = {
    success: true,
    properties,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  };

  // Cache the results for 2 minutes (120 seconds)
  // Only cache if there are results and it's not a very specific query
  if (count > 0 && !req.query.keyword) {
    cacheManager.set(cacheKey, responseData, 120);
  }

  res.json(responseData);
});

// @desc    Get featured properties
// @route   GET /api/properties/featured
// @access  Public
const getFeaturedProperties = async (_, res) => {
  try {
    console.log('Fetching featured properties...');

    // Define cache key
    const cacheKey = 'featured_properties';

    // Try to get data from cache first
    const cachedData = cacheManager.get(cacheKey);
    if (cachedData) {
      console.log('Serving featured properties from cache');
      return res.json({
        success: true,
        properties: cachedData,
        fromCache: true
      });
    }

    // First check if we have any featured properties
    const count = await Property.count({
      where: { featured: true }
    });
    console.log(`Found ${count} featured properties`);

    // If no featured properties, just get the most recent properties
    let whereClause = {};

    if (count > 0) {
      whereClause.featured = true;
    }

    console.log('Using where clause:', JSON.stringify(whereClause));

    // If not in cache, fetch from database
    const properties = await Property.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'agent',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'avatar'],
        },
        {
          model: Developer,
          as: 'developer',
          attributes: ['id', 'name', 'logo', 'slug'],
        },
      ],
      order: count > 0 ? [] : [['createdAt', 'DESC']],
      limit: 6,
    });

    console.log(`Successfully retrieved ${properties.length} properties`);

    // Store in cache for 10 minutes (600 seconds)
    cacheManager.set(cacheKey, properties, 600);

    res.json({
      success: true,
      properties,
    });
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured properties',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Get single property by ID
// @route   GET /api/properties/:id
// @access  Public
const getPropertyById = asyncHandler(async (req, res) => {
  // Check if id is valid
  const id = req.params.id;
  if (!id || id === 'undefined' || isNaN(Number(id))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid property ID',
    });
  }

  // Define cache key - we don't cache this by default because views get incremented
  // But we can cache it if the request specifies noIncrement=true
  const noIncrement = req.query.noIncrement === 'true';
  const cacheKey = `property_${id}_${noIncrement}`;

  // Try to get from cache if noIncrement is true
  if (noIncrement) {
    const cachedProperty = cacheManager.get(cacheKey);
    if (cachedProperty) {
      console.log(`Serving property ${id} from cache`);
      return res.json({
        success: true,
        property: cachedProperty,
        fromCache: true
      });
    }
  }

  const property = await Property.findByPk(id, {
    include: [
      {
        model: User,
        as: 'agent',
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'avatar'],
      },
      {
        model: Developer,
        as: 'developer',
        attributes: ['id', 'name', 'description', 'logo', 'website', 'established', 'headquarters', 'slug'],
      },
    ],
  });

  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found',
    });
  }

  // Increment views if the field exists and noIncrement is false
  if (property.views !== undefined && !noIncrement) {
    property.views = (property.views || 0) + 1;
    await property.save();
  }

  // Cache the property for 5 minutes if noIncrement is true
  if (noIncrement) {
    cacheManager.set(cacheKey, property, 300);
  }

  res.json({
    success: true,
    property,
  });
});

// @desc    Create a new property
// @route   POST /api/properties
// @access  Private/Agent
const createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      location,
      address,
      city,
      state,
      zipCode,
      propertyType,
      status,
      bedrooms,
      bathrooms,
      area,
      features,
      yearBuilt,
      paymentPlan,
    } = req.body;

    // Process images
    let images = [];
    let mainImage = '';
    let headerImage = '';

    if (req.files) {
      // With upload.fields(), files are organized by field name
      // Process header image if available
      if (req.files.headerImage && req.files.headerImage.length > 0) {
        const headerImageFile = req.files.headerImage[0];
        headerImage = `/uploads/${headerImageFile.filename}`;
      }

      // Process regular images if available
      if (req.files.images && req.files.images.length > 0) {
        images = req.files.images.map((file) => `/uploads/${file.filename}`);
        mainImage = images[0]; // Set first image as main image
      }
    }

    // Parse features if it's a string
    let parsedFeatures = features;
    if (typeof features === 'string') {
      try {
        parsedFeatures = JSON.parse(features);
      } catch (e) {
        parsedFeatures = features.split(',').map(item => item.trim());
      }
    }

    // Create property
    const isOffplan = req.body.isOffplan === 'true' || req.body.isOffplan === true;

    // Prepare property data
    const propertyData = {
      title,
      description,
      price,
      location,
      address,
      city,
      state,
      zipCode,
      propertyType,
      status,
      isOffplan,
      developerId: req.body.developerId || null,
      bedrooms,
      bathrooms,
      area,
      features: parsedFeatures,
      images,
      mainImage,
      headerImage,
      paymentPlan,
      agentId: req.user.id,
      yearBuilt,
      featured: false,
    };

    // Add bedroomRange for offplan properties
    if (isOffplan && req.body.bedroomRange) {
      propertyData.bedroomRange = req.body.bedroomRange;
    }

    const property = await Property.create(propertyData);

    // Fetch the property with agent details
    const propertyWithAgent = await Property.findByPk(property.id, {
      include: [
        {
          model: User,
          as: 'agent',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'avatar'],
        },
        {
          model: Developer,
          as: 'developer',
          attributes: ['id', 'name', 'logo', 'slug'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      property: propertyWithAgent,
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

// @desc    Update a property
// @route   PUT /api/properties/:id
// @access  Private/Agent
const updateProperty = async (req, res) => {
  try {
    // Check if id is valid
    const id = req.params.id;
    if (!id || id === 'undefined' || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid property ID',
      });
    }

    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Check if user is the agent or admin
    if (
      property.agentId !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this property',
      });
    }

    // Update fields
    const {
      title,
      description,
      price,
      location,
      address,
      city,
      state,
      zipCode,
      propertyType,
      status,
      bedrooms,
      bathrooms,
      area,
      features,
      yearBuilt,
      paymentPlan,
      featured,
      existingImages,
    } = req.body;

    // Create update object
    const updateData = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (price) updateData.price = price;
    if (location) updateData.location = location;
    if (address) updateData.address = address;
    if (city) updateData.city = city;
    if (state) updateData.state = state;
    if (zipCode) updateData.zipCode = zipCode;
    if (propertyType) updateData.propertyType = propertyType;
    if (status) updateData.status = status;


    // Handle isOffplan field explicitly if provided
    if (req.body.isOffplan !== undefined) {
      updateData.isOffplan = req.body.isOffplan === 'true' || req.body.isOffplan === true;
    }

    // Update developer if provided
    if (req.body.developerId) {
      updateData.developerId = req.body.developerId;
    }

    // Handle bedroomRange for offplan properties
    if (updateData.isOffplan && req.body.bedroomRange) {
      updateData.bedroomRange = req.body.bedroomRange;
    }
    if (bedrooms) updateData.bedrooms = bedrooms;
    if (bathrooms) updateData.bathrooms = bathrooms;
    if (area) updateData.area = area;

    // Parse features if it's a string
    if (features) {
      if (typeof features === 'string') {
        try {
          updateData.features = JSON.parse(features);
        } catch (e) {
          updateData.features = features.split(',').map(item => item.trim());
        }
      } else {
        updateData.features = features;
      }
    }

    if (yearBuilt) updateData.yearBuilt = yearBuilt;
    if (paymentPlan) updateData.paymentPlan = paymentPlan;
    if (featured !== undefined && req.user.role === 'admin') {
      updateData.featured = featured === 'true' || featured === true;
    }

    // Handle existing images if provided
    if (existingImages) {
      try {
        // Parse the existingImages JSON string
        const parsedImages = JSON.parse(existingImages);

        // Store the old images for later cleanup
        const oldImages = property.images || [];

        // Update the images in the database
        updateData.images = parsedImages;

        // If images array is empty or if the main image was removed, update main image
        if (parsedImages.length === 0) {
          updateData.mainImage = null;
        } else if (!parsedImages.includes(property.mainImage)) {
          updateData.mainImage = parsedImages[0];
        }

        // Delete unused images from the server
        await deleteUnusedImages(oldImages, parsedImages);
      } catch (e) {
        console.error('Error parsing existingImages:', e);
      }
    }

    // Process new images
    if (req.files) {
      // With upload.fields(), files are organized by field name
      // Process header image if available
      if (req.files.headerImage && req.files.headerImage.length > 0) {
        // If there's an existing header image, delete it
        if (property.headerImage) {
          await deleteFile(property.headerImage);
        }

        const headerImageFile = req.files.headerImage[0];
        updateData.headerImage = `/uploads/${headerImageFile.filename}`;
      } else if (req.body.existingHeaderImage === '') {
        // If existingHeaderImage is empty string, it means the header image was removed
        if (property.headerImage) {
          await deleteFile(property.headerImage);
        }
        updateData.headerImage = null;
      }

      // Process regular images if available
      if (req.files.images && req.files.images.length > 0) {
        const newImages = req.files.images.map((file) => `/uploads/${file.filename}`);

        // If existingImages was provided, add new images to the parsed array
        if (updateData.images) {
          updateData.images = [...updateData.images, ...newImages];
        } else {
          // Otherwise, add new images to existing images from the database
          updateData.images = [...(property.images || []), ...newImages];
        }

        // If no main image, set first image as main
        if ((!property.mainImage || updateData.mainImage === null) && updateData.images.length > 0) {
          updateData.mainImage = updateData.images[0];
        }
      }
    }

    // Update the property
    await property.update(updateData);

    // Clear related caches
    cacheManager.remove(`property_${property.id}_true`);
    cacheManager.remove(`property_${property.id}_false`);

    // If this is a featured property, clear the featured properties cache
    if (property.featured || updateData.featured) {
      cacheManager.remove('featured_properties');
    }

    // Clear any properties list caches
    // This is a simple approach - in a more complex system, you might want to be more selective
    const cacheKeys = Object.keys(cacheManager.getStats());
    cacheKeys.forEach(key => {
      if (key.startsWith('properties_')) {
        cacheManager.remove(key);
      }
    });

    // Fetch the updated property with agent details
    const updatedProperty = await Property.findByPk(property.id, {
      include: [
        {
          model: User,
          as: 'agent',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'avatar'],
        },
        {
          model: Developer,
          as: 'developer',
          attributes: ['id', 'name', 'logo', 'slug'],
        },
      ],
    });

    res.json({
      success: true,
      property: updatedProperty,
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

// @desc    Delete a property
// @route   DELETE /api/properties/:id
// @access  Private/Agent
const deleteProperty = async (req, res) => {
  try {
    // Check if id is valid
    const id = req.params.id;
    if (!id || id === 'undefined' || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid property ID',
      });
    }

    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Check if user is the agent or admin
    if (
      Number(property.agentId) !== Number(req.user.id) &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this property',
      });
    }

    // First, delete any related records
    const { Inquiry, SavedProperty, Message, OffplanInquiry, sequelize } = require('../models');

    // Use a transaction to ensure all operations succeed or fail together
    const transaction = await sequelize.transaction();

    try {
      // First, find all inquiries for this property
      const inquiries = await Inquiry.findAll({
        where: { propertyId: id },
        transaction
      });

      // Delete messages related to inquiries for this property
      if (inquiries.length > 0) {
        const inquiryIds = inquiries.map(inquiry => inquiry.id);
        await Message.destroy({
          where: { inquiryId: inquiryIds },
          transaction
        });
      }

      // Now it's safe to delete the inquiries
      await Inquiry.destroy({
        where: { propertyId: id },
        transaction
      });

      // Delete related offplan inquiries
      await OffplanInquiry.destroy({
        where: { propertyId: id },
        transaction
      });

      // Delete saved properties references
      await SavedProperty.destroy({
        where: { propertyId: id },
        transaction
      });

      // Get all images associated with the property before deleting it
      const propertyImages = property.images || [];
      const headerImage = property.headerImage;

      // Then delete the property
      await property.destroy({ transaction });

      // Commit the transaction
      await transaction.commit();

      // After successful transaction, delete all image files
      if (propertyImages.length > 0) {
        console.log(`Deleting ${propertyImages.length} property images`);
        for (const image of propertyImages) {
          await deleteFile(image);
        }
      }

      // Delete header image if it exists
      if (headerImage) {
        await deleteFile(headerImage);
      }
    } catch (error) {
      // Rollback the transaction if any operation fails
      await transaction.rollback();
      throw error;
    }

    res.json({
      success: true,
      message: 'Property removed',
    });
  } catch (error) {
    console.error('Error deleting property:', error);
    console.error('Stack trace:', error.stack);

    // Check for foreign key constraint error
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      console.log('Foreign key constraint error details:', {
        table: error.table,
        index: error.index,
        detail: error.parent?.detail,
        sql: error.sql
      });

      // Extract the table name from the constraint for a more specific message
      const constraintTable = error.index?.split('_')[0] || 'unknown';
      const referencedTable = error.parent?.table || 'unknown';

      return res.status(400).json({
        success: false,
        message: `Cannot delete this property because it has related ${referencedTable} records. Please contact the administrator.`,
        error: error.message,
        constraint: error.index,
        detail: error.parent?.detail,
        table: error.table,
        referencedTable: error.parent?.table
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Get properties by agent
// @route   GET /api/properties/agent/:id
// @access  Public
const getAgentProperties = async (req, res) => {
  try {
    // Check if id is valid
    const id = req.params.id;
    if (!id || id === 'undefined' || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid agent ID',
      });
    }

    const properties = await Property.findAll({
      where: { agentId: id },
      include: [
        {
          model: User,
          as: 'agent',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'avatar'],
        },
        {
          model: Developer,
          as: 'developer',
          attributes: ['id', 'name', 'logo', 'slug'],
        },
      ],
    });

    res.json({
      success: true,
      properties,
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

// @desc    Get off plan properties
// @route   GET /api/properties/offplan
// @access  Public
const getOffPlanProperties = async (req, res) => {
  try {
    const pageSize = 9;
    const page = Number(req.query.page) || 1;

    // Build where clause for filtering
    const whereClause = { isOffplan: true };

    // Filter by property type
    if (req.query.type) {
      whereClause.propertyType = req.query.type;
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      whereClause.price = {};
      if (req.query.minPrice) {
        whereClause.price[Op.gte] = Number(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        whereClause.price[Op.lte] = Number(req.query.maxPrice);
      }
    }

    // Filter by bedrooms
    if (req.query.bedrooms) {
      whereClause.bedrooms = { [Op.gte]: Number(req.query.bedrooms) };
    }

    // Filter by location
    if (req.query.location) {
      whereClause.location = { [Op.like]: `%${req.query.location}%` };
    }

    // Search by keyword
    if (req.query.keyword) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${req.query.keyword}%` } },
        { description: { [Op.like]: `%${req.query.keyword}%` } },
        { location: { [Op.like]: `%${req.query.keyword}%` } },
      ];
    }

    // Get properties with pagination and count
    const { count, rows: properties } = await Property.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'agent',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'avatar'],
        },
        {
          model: Developer,
          as: 'developer',
          attributes: ['id', 'name', 'logo', 'slug'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset: pageSize * (page - 1),
    });

    res.json({
      success: true,
      properties,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
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
  getProperties,
  getFeaturedProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getAgentProperties,
  getOffPlanProperties,
};
