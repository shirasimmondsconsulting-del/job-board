const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// Static routes MUST come before dynamic /:id routes
router.get('/', protect, notificationController.getNotifications);
router.post('/', protect, notificationController.createNotification);
router.post('/bulk', protect, notificationController.bulkCreateNotifications);
router.get('/count', protect, notificationController.getNotificationCount);
router.get('/types', notificationController.getNotificationTypes);
router.put('/mark-all-read', protect, notificationController.markAllAsRead);
router.delete('/', protect, notificationController.deleteAllNotifications);
router.put('/preferences', protect, notificationController.updateNotificationPreferences);
router.get('/preferences', protect, notificationController.getNotificationPreferences);

// Dynamic :id routes
router.put('/:id/read', protect, notificationController.markAsRead);
router.delete('/:id', protect, notificationController.deleteNotification);

module.exports = router;