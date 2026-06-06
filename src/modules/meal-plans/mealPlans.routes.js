const express = require('express');
const validate = require('../../middlewares/validate.middleware');
const { createPlanSchema, updatePlanSchema, createItemSchema } = require('./mealPlans.schema');
const mealPlansController = require('./mealPlans.controller');

const router = express.Router();

router.get('/', mealPlansController.listPlans);
router.post('/', validate(createPlanSchema), mealPlansController.createPlan);
router.get('/:plan_id', mealPlansController.getPlan);
router.put('/:plan_id', validate(updatePlanSchema), mealPlansController.updatePlan);
router.delete('/:plan_id', mealPlansController.deletePlan);
router.get('/:plan_id/items', mealPlansController.listItems);
router.post('/:plan_id/items', validate(createItemSchema), mealPlansController.addItem);
router.delete('/:plan_id/items/:item_id', mealPlansController.deleteItem);

module.exports = router;
