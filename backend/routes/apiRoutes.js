const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const { protect } = require('../controllers/authController');

router.get('/status', apiController.getStatus);
router.get('/packages', apiController.getPackages);
router.get('/dashboard', protect, apiController.getDashboard);
router.get('/team', protect, apiController.getTeam);
router.get('/profile', protect, apiController.getProfile);
router.get('/admin/stats', protect, apiController.getAdminStats);

module.exports = router;
