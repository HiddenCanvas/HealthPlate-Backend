const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboard.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/summary', ctrl.getSummary);
router.get('/history', ctrl.getHistory);

module.exports = router;