const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/barcode.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/:barcode', ctrl.lookupBarcode);

module.exports = router;
