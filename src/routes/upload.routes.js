const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/upload.controller');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authMiddleware);

router.post('/avatar', upload.single('image'), ctrl.uploadAvatar);
router.post('/recipe/:id', upload.single('image'), ctrl.uploadRecipeImage);
router.post('/consumption-photo', upload.single('image'), ctrl.uploadConsumptionPhoto);

module.exports = router;
