const Service = require('../models/Service');
const fs = require('fs');
const path = require('path');

// @desc    Get all active services with filtering, search, and pagination
// @route   GET /api/services
// @access  Public
const getServices = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 6 } = req.query;

    const query = { status: 'active' };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { short_description: { $regex: search, $options: 'i' } }
      ];
    }

    const startIndex = (page - 1) * limit;
    const total = await Service.countDocuments(query);

    const services = await Service.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: services.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: services
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single service by slug
// @route   GET /api/services/:slug
// @access  Public
const getServiceBySlug = async (req, res, next) => {
  try {
    const service = await Service.findOne({ slug: req.params.slug, status: 'active' });

    if (!service) {
      res.status(404);
      return next(new Error('Service not found'));
    }

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all services (including inactive) for admin
// @route   GET /api/services/admin
// @access  Private
const getAdminServices = async (req, res, next) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new service
// @route   POST /api/services
// @access  Private
const createService = async (req, res, next) => {
  try {
    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.image_url) {
      imageUrl = req.body.image_url;
    } else {
      res.status(400);
      return next(new Error('Please upload an image'));
    }

    const serviceData = {
      ...req.body,
      image_url: imageUrl
    };

    const service = await Service.create(serviceData);

    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private
const updateService = async (req, res, next) => {
  try {
    let service = await Service.findById(req.params.id);

    if (!service) {
      res.status(404);
      return next(new Error('Service not found'));
    }

    const updateData = { ...req.body };

    if (req.file) {
      updateData.image_url = `/uploads/${req.file.filename}`;
      // Optional: Delete old image from server
      if (service.image_url && service.image_url.startsWith('/uploads')) {
        const oldImagePath = path.join(__dirname, '..', service.image_url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    // Since we are using pre-save hook for slug, we use save() instead of findByIdAndUpdate
    // Or we manually handle slug generation. Let's use findByIdAndUpdate for simplicity 
    // but we need to generate slug if title changed.
    
    if (updateData.title && updateData.title !== service.title) {
       const slugify = require('slugify');
       updateData.slug = slugify(updateData.title, { lower: true, strict: true });
    }

    service = await Service.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private
const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      res.status(404);
      return next(new Error('Service not found'));
    }

    if (service.image_url && service.image_url.startsWith('/uploads')) {
      const oldImagePath = path.join(__dirname, '..', service.image_url);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    await service.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServices,
  getServiceBySlug,
  getAdminServices,
  createService,
  updateService,
  deleteService
};
