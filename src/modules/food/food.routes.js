const express = require('express');
const validate = require('../../middlewares/validate.middleware');
const { productsQuerySchema } = require('./food.schema');
const foodController = require('./food.controller');

const router = express.Router();

router.get('/categories', foodController.getCategories);
router.get('/products', validate(productsQuerySchema, 'query'), foodController.getProducts);
router.get('/products/:id', foodController.getProductById);
router.get('/barcode/:barcode', foodController.getProductByBarcode);

module.exports = router;
