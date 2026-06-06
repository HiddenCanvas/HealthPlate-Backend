const express = require('express');
const notificationsController = require('./notifications.controller');

const router = express.Router();

router.get('/', notificationsController.listNotifications);
router.patch('/:notification_id/read', notificationsController.markAsRead);
router.patch('/read-all', notificationsController.markAllAsRead);

module.exports = router;
