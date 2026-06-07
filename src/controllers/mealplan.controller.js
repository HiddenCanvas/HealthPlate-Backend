const srv = require('../services/mealplan.service');

const getAllMealPlans = async (req, res, next) => {
  try {
    const data = await srv.getAllMealPlans(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const createMealPlan = async (req, res, next) => {
  try {
    const data = await srv.createMealPlan(req.user.id, req.body);
    return res.status(201).json({ success: true, message: 'Meal plan berhasil dibuat.', data });
  } catch (err) { next(err); }
};

const getMealPlanById = async (req, res, next) => {
  try {
    const data = await srv.getMealPlanById(req.user.id, req.params.id);
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const updateMealPlan = async (req, res, next) => {
  try {
    const data = await srv.updateMealPlan(req.user.id, req.params.id, req.body);
    return res.status(200).json({ success: true, message: 'Meal plan berhasil diupdate.', data });
  } catch (err) { next(err); }
};

const deleteMealPlan = async (req, res, next) => {
  try {
    await srv.deleteMealPlan(req.user.id, req.params.id);
    return res.status(200).json({ success: true, message: 'Meal plan berhasil dihapus.' });
  } catch (err) { next(err); }
};

const addItem = async (req, res, next) => {
  try {
    const data = await srv.addItem(req.user.id, req.params.id, req.body);
    return res.status(201).json({ success: true, message: 'Item berhasil ditambahkan.', data });
  } catch (err) { next(err); }
};

const deleteItem = async (req, res, next) => {
  try {
    await srv.deleteItem(req.user.id, req.params.id, req.params.itemId);
    return res.status(200).json({ success: true, message: 'Item berhasil dihapus.' });
  } catch (err) { next(err); }
};

module.exports = { getAllMealPlans, createMealPlan, getMealPlanById, updateMealPlan, deleteMealPlan, addItem, deleteItem };
