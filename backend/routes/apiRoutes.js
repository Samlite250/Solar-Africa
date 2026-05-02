const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const { protect } = require('../controllers/authController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/status', apiController.getStatus);
router.get('/packages', apiController.getPackages);
router.get('/dashboard', protect, apiController.getDashboard);
router.get('/team', protect, apiController.getTeam);
router.get('/profile', protect, apiController.getProfile);
router.put('/profile', protect, apiController.updateProfile);
router.get('/activity', protect, apiController.getActivity);
router.post('/deposits', protect, apiController.createDeposit);
router.get('/deposits', protect, apiController.getDeposits);
router.post('/withdrawals', protect, apiController.createWithdrawal);
router.get('/withdrawals', protect, apiController.getWithdrawals);
router.get('/notifications', protect, apiController.getNotifications);
router.put('/notifications/:id/read', protect, apiController.markNotificationRead);
router.post('/tasks/complete', protect, apiController.completeTask);

// Admin Routes
router.get('/admin/stats', protect, apiController.getAdminStats);
router.put('/admin/deposits/:id', protect, apiController.adminUpdateDeposit);
router.put('/admin/users/:id', protect, apiController.adminUpdateUser);
router.post('/admin/packages', protect, apiController.adminCreatePackage);
router.post('/admin/notifications', protect, apiController.adminPushNotification);

router.delete('/admin/packages/:id', protect, apiController.adminDeletePackage);
// Admin: Users management is handled by the route on line 26

// Payment Methods
router.get('/payment-methods', apiController.getPaymentMethods); // Public (users need this)
router.post('/admin/payment-methods', protect, apiController.createPaymentMethod);
router.put('/admin/payment-methods/:id', protect, apiController.updatePaymentMethod);
router.delete('/admin/payment-methods/:id', protect, apiController.deletePaymentMethod);

// Video Tasks
router.get('/tasks', apiController.getTasks);                           // Public — users load tasks
router.post('/admin/tasks', protect, apiController.adminCreateTask);
router.put('/admin/tasks/:id', protect, apiController.adminUpdateTask);
router.delete('/admin/tasks/:id', protect, apiController.adminDeleteTask);
router.post('/admin/tasks/upload', protect, upload.single('video'), apiController.adminUploadVideo);

module.exports = router;
