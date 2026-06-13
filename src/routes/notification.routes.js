const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const ctrl = require('../controllers/notification.controller');
const settingsSrv = require('../services/notification.settings.service');

router.use(authMiddleware);

// FCM Token
router.post('/token', ctrl.saveFcmToken);
// Alias for backward compatibility
router.post('/fcm-token', ctrl.saveFcmToken);

// Notifications CRUD
router.get('/', ctrl.getNotifications);
router.post('/', ctrl.createNotification);
router.patch('/:id/read', ctrl.markAsRead);
router.patch('/read-all', ctrl.markAllAsRead);

// Modern Notification Preferences
router.get('/settings', ctrl.getSettings);
router.put('/settings', ctrl.putSettings);

// Legacy Meal Reminder Settings (for compatibility)
router.put('/settings/:type', async (req, res, next) => {
  try {
    const data = await settingsSrv.updateSetting(req.user.id, req.params.type, req.body);
    return res.status(200).json({ success: true, message: 'Setting notifikasi berhasil diupdate.', data });
  } catch (err) { next(err); }
});

router.post('/settings/reset', async (req, res, next) => {
  try {
    const data = await settingsSrv.resetSettings(req.user.id);
    return res.status(200).json({ success: true, message: 'Setting notifikasi direset ke default.', data });
  } catch (err) { next(err); }
});

module.exports = router;
