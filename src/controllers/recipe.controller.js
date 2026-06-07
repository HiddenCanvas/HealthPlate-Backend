const srv = require('../services/recipe.service');

const getAllRecipes = async (req, res, next) => {
  try {
    const data = await srv.getAllRecipes();
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const getRecipeById = async (req, res, next) => {
  try {
    const data = await srv.getRecipeById(req.params.id);
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const createRecipe = async (req, res, next) => {
  try {
    const data = await srv.createRecipe(req.user.id, req.body);
    return res.status(201).json({ success: true, message: 'Resep berhasil dibuat.', data });
  } catch (err) { next(err); }
};

const updateRecipe = async (req, res, next) => {
  try {
    const data = await srv.updateRecipe(req.user.id, req.params.id, req.body);
    return res.status(200).json({ success: true, message: 'Resep berhasil diupdate.', data });
  } catch (err) { next(err); }
};

const deleteRecipe = async (req, res, next) => {
  try {
    await srv.deleteRecipe(req.user.id, req.params.id);
    return res.status(200).json({ success: true, message: 'Resep berhasil dihapus.' });
  } catch (err) { next(err); }
};

const addIngredient = async (req, res, next) => {
  try {
    const data = await srv.addIngredient(req.user.id, req.params.id, req.body);
    return res.status(201).json({ success: true, message: 'Bahan berhasil ditambahkan.', data });
  } catch (err) { next(err); }
};

const deleteIngredient = async (req, res, next) => {
  try {
    await srv.deleteIngredient(req.user.id, req.params.id, req.params.bahanId);
    return res.status(200).json({ success: true, message: 'Bahan berhasil dihapus.' });
  } catch (err) { next(err); }
};

module.exports = { getAllRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe, addIngredient, deleteIngredient };
