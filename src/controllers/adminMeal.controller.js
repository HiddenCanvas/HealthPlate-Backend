const srv = require('../services/adminMeal.service');

const getAllMealCategories = async (req, res, next) => {
  try {
    const data = await srv.getAllMealCategories();
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const getMealCategoryById = async (req, res, next) => {
  try {
    const data = await srv.getMealCategoryById(req.params.id);
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const createMealCategory = async (req, res, next) => {
  try {
    const data = await srv.createMealCategory(req.body);
    return res.status(201).json({ success: true, message: 'Kategori paket makan berhasil dibuat.', data });
  } catch (err) { next(err); }
};

const updateMealCategory = async (req, res, next) => {
  try {
    const data = await srv.updateMealCategory(req.params.id, req.body);
    return res.status(200).json({ success: true, message: 'Kategori paket makan berhasil diupdate.', data });
  } catch (err) { next(err); }
};

const deleteMealCategory = async (req, res, next) => {
  try {
    await srv.deleteMealCategory(req.params.id);
    return res.status(200).json({ success: true, message: 'Kategori paket makan berhasil dihapus.' });
  } catch (err) { next(err); }
};

const getAllMealPackages = async (req, res, next) => {
  try {
    const data = await srv.getAllMealPackages();
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const getMealPackageById = async (req, res, next) => {
  try {
    const data = await srv.getMealPackageById(req.params.id);
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const createMealPackage = async (req, res, next) => {
  try {
    const data = await srv.createMealPackage(req.body);
    return res.status(201).json({ success: true, message: 'Paket makan berhasil dibuat.', data });
  } catch (err) { next(err); }
};

const updateMealPackage = async (req, res, next) => {
  try {
    const data = await srv.updateMealPackage(req.params.id, req.body);
    return res.status(200).json({ success: true, message: 'Paket makan berhasil diupdate.', data });
  } catch (err) { next(err); }
};

const deleteMealPackage = async (req, res, next) => {
  try {
    await srv.deleteMealPackage(req.params.id);
    return res.status(200).json({ success: true, message: 'Paket makan berhasil dihapus.' });
  } catch (err) { next(err); }
};

module.exports = {
  getAllMealCategories,
  getMealCategoryById,
  createMealCategory,
  updateMealCategory,
  deleteMealCategory,
  getAllMealPackages,
  getMealPackageById,
  createMealPackage,
  updateMealPackage,
  deleteMealPackage
};
