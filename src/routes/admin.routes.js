const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const foodCtrl = require('../controllers/adminFood.controller');

router.use(adminAuth);

router.get('/food-categories', foodCtrl.getAllCategories);
router.get('/food-categories/:id', foodCtrl.getCategoryById);
router.post('/food-categories', foodCtrl.createCategory);
router.put('/food-categories/:id', foodCtrl.updateCategory);
router.delete('/food-categories/:id', foodCtrl.deleteCategory);

router.get('/foods', foodCtrl.getAllFoods);
router.get('/foods/:id', foodCtrl.getFoodById);
router.post('/foods', foodCtrl.createFood);
router.put('/foods/:id', foodCtrl.updateFood);
router.delete('/foods/:id', foodCtrl.deleteFood);

module.exports = router;
