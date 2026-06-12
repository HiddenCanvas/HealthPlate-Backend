const srv = require('../services/adminFood.service');

const getAllCategories = async (req, res, next) => {
  try {
    const data = await srv.getAllCategories();
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const getCategoryById = async (req, res, next) => {
  try {
    const data = await srv.getCategoryById(req.params.id);
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const createCategory = async (req, res, next) => {
  try {
    const data = await srv.createCategory(req.body);
    return res.status(201).json({ success: true, message: 'Kategori makanan berhasil dibuat.', data });
  } catch (err) { next(err); }
};

const updateCategory = async (req, res, next) => {
  try {
    const data = await srv.updateCategory(req.params.id, req.body);
    return res.status(200).json({ success: true, message: 'Kategori makanan berhasil diupdate.', data });
  } catch (err) { next(err); }
};

const deleteCategory = async (req, res, next) => {
  try {
    await srv.deleteCategory(req.params.id);
    return res.status(200).json({ success: true, message: 'Kategori makanan berhasil dihapus.' });
  } catch (err) { next(err); }
};

const getAllFoods = async (req, res, next) => {
  try {
    const result = await srv.getAllFoods(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (err) { next(err); }
};

const getFoodById = async (req, res, next) => {
  try {
    const data = await srv.getFoodById(req.params.id);
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const createFood = async (req, res, next) => {
  try {
    const data = await srv.createFood(req.body);
    return res.status(201).json({ success: true, message: 'Makanan berhasil dibuat.', data });
  } catch (err) { next(err); }
};

const updateFood = async (req, res, next) => {
  try {
    const data = await srv.updateFood(req.params.id, req.body);
    return res.status(200).json({ success: true, message: 'Makanan berhasil diupdate.', data });
  } catch (err) { next(err); }
};

const deleteFood = async (req, res, next) => {
  try {
    await srv.deleteFood(req.params.id);
    return res.status(200).json({ success: true, message: 'Makanan berhasil dihapus.' });
  } catch (err) { next(err); }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood
};
