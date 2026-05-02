const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

const {
  getServices,
  getServiceBySlug,
  getAdminServices,
  createService,
  updateService,
  deleteService
} = require('../controllers/serviceController');

// Public routes
router.route('/').get(getServices);
router.route('/:slug').get(getServiceBySlug);

// Admin routes (Protected)
router.route('/admin/all').get(protect, getAdminServices);
router.route('/').post(protect, upload.single('image'), createService);
router.route('/:id')
  .put(protect, upload.single('image'), updateService)
  .delete(protect, deleteService);

module.exports = router;
