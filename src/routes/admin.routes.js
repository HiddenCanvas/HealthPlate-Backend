const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const foodCtrl = require('../controllers/adminFood.controller');
const mealCtrl = require('../controllers/adminMeal.controller');
const monitoringCtrl = require('../controllers/adminMonitoring.controller');

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

router.get('/meal-categories', mealCtrl.getAllMealCategories);
router.get('/meal-categories/:id', mealCtrl.getMealCategoryById);
router.post('/meal-categories', mealCtrl.createMealCategory);
router.put('/meal-categories/:id', mealCtrl.updateMealCategory);
router.delete('/meal-categories/:id', mealCtrl.deleteMealCategory);

router.get('/meal-packages', mealCtrl.getAllMealPackages);
router.get('/meal-packages/:id', mealCtrl.getMealPackageById);
router.post('/meal-packages', mealCtrl.createMealPackage);
router.put('/meal-packages/:id', mealCtrl.updateMealPackage);
router.delete('/meal-packages/:id', mealCtrl.deleteMealPackage);

router.get('/users', monitoringCtrl.getUsers);
router.get('/logs', monitoringCtrl.getLogs);

module.exports = router;
