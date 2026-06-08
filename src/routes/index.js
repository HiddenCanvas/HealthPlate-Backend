const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/nutrition', require('./nutrition.routes'));
router.use('/log', require('./log.routes'));
router.use('/mealplan', require('./mealplan.routes'));
router.use('/dashboard', require('./dashboard.routes'));
router.use('/scan', require('./scan.routes'));
router.use('/recipe', require('./recipe.routes'));
router.use('/upload', require('./upload.routes'));
router.use('/notification', require('./notification.routes'));

module.exports = router;
