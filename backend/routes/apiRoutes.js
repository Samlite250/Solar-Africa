const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const { protect } = require('../controllers/authController');

router.get('/status', apiController.getStatus);
router.get('/packages', apiController.getPackages);
router.get('/dashboard', protect, apiController.getDashboard);
router.get('/team', protect, apiController.getTeam);
router.get('/profile', protect, apiController.getProfile);
router.put('/profile', protect, apiController.updateProfile);
router.get('/activity', protect, apiController.getActivity);
router.post('/deposits', protect, apiController.createDeposit);
router.post('/withdrawals', protect, apiController.createWithdrawal);

// Admin Routes
router.get('/admin/stats', protect, apiController.getAdminStats);
router.put('/admin/deposits/:id', protect, apiController.adminUpdateDeposit);
router.put('/admin/users/:id', protect, apiController.adminUpdateUser);
router.post('/admin/packages', protect, apiController.adminCreatePackage);

router.delete('/admin/packages/:id', protect, apiController.adminDeletePackage);


module.exports = router;
