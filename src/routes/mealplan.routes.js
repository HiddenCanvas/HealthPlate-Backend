const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/mealplan.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', ctrl.getAllMealPlans);
router.post('/', ctrl.createMealPlan);
router.get('/:id', ctrl.getMealPlanById);
router.put('/:id', ctrl.updateMealPlan);
router.delete('/:id', ctrl.deleteMealPlan);
router.post('/:id/items', ctrl.addItem);
router.delete('/:id/items/:itemId', ctrl.deleteItem);

module.exports = router;
