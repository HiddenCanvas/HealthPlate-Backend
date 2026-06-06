const { success } = require('../../utils/response');
const mealPlansService = require('./mealPlans.service');

const listPlans = async (req, res, next) => {
  try {
    const data = await mealPlansService.listPlans(req.user.id);
    return success(res, data, 'Meal plans retrieved');
  } catch (err) {
    next(err);
  }
};

const createPlan = async (req, res, next) => {
  try {
    const data = await mealPlansService.createPlan(req.user.id, req.body);
    return success(res, data, 'Meal plan created', 201);
  } catch (err) {
    next(err);
  }
};

const getPlan = async (req, res, next) => {
  try {
    const data = await mealPlansService.getPlan(req.user.id, req.params.plan_id);
    return success(res, data, 'Meal plan retrieved');
  } catch (err) {
    next(err);
  }
};

const updatePlan = async (req, res, next) => {
  try {
    const data = await mealPlansService.updatePlan(req.user.id, req.params.plan_id, req.body);
    return success(res, data, 'Meal plan updated');
  } catch (err) {
    next(err);
  }
};

const deletePlan = async (req, res, next) => {
  try {
    await mealPlansService.deletePlan(req.user.id, req.params.plan_id);
    return success(res, null, 'Meal plan deleted');
  } catch (err) {
    next(err);
  }
};

const listItems = async (req, res, next) => {
  try {
    const data = await mealPlansService.listItems(req.user.id, req.params.plan_id);
    return success(res, data, 'Meal plan items retrieved');
  } catch (err) {
    next(err);
  }
};

const addItem = async (req, res, next) => {
  try {
    const data = await mealPlansService.createItem(req.user.id, req.params.plan_id, req.body);
    return success(res, data, 'Meal plan item created', 201);
  } catch (err) {
    next(err);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    await mealPlansService.deleteItem(req.user.id, req.params.plan_id, req.params.item_id);
    return success(res, null, 'Meal plan item deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { listPlans, createPlan, getPlan, updatePlan, deletePlan, listItems, addItem, deleteItem };
