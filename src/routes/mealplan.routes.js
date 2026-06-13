const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/mealplan.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/',           ctrl.getAllMealPlans);
router.post('/',          ctrl.createMealPlan);
router.post('/apply-package', ctrl.applyPackage);

// GET meal plan berdasarkan tanggal — harus SEBELUM /:id
router.get('/date/:date', ctrl.getMealPlanByDate);

router.get('/:id',                        ctrl.getMealPlanById);
router.put('/:id',                        ctrl.updateMealPlan);
router.delete('/:id',                     ctrl.deleteMealPlan);
router.post('/:id/items',                 ctrl.addItem);
router.delete('/:id/items/:itemId',       ctrl.deleteItem);

// Hapus semua item pada tanggal tertentu saja (tidak hapus plan atau hari lain)
router.delete('/:id/items/date/:date',    ctrl.deleteItemsByDate);

module.exports = router;
