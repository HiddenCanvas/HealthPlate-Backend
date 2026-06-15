const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const ctrl = require('../controllers/notification.controller');

router.use(authMiddleware);

router.post('/fcm-token', ctrl.saveFcmToken);
router.delete('/fcm-token', ctrl.deleteFcmToken);

module.exports = router;
