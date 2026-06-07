const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/nutrition.controller');

router.get('/foods', ctrl.getAllFoods);
router.get('/foods/search', ctrl.searchFoods);
router.get('/foods/barcode/:code', ctrl.getFoodByBarcode);
router.get('/foods/:id', ctrl.getFoodById);

module.exports = router;
