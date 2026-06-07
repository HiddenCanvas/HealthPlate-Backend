const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/scan.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/barcode', ctrl.scanBarcode);

module.exports = router;
