const { success } = require('../../utils/response');
const recipesService = require('./recipes.service');

const listRecipes = async (req, res, next) => {
  try {
    const data = await recipesService.listRecipes(req.query);
    return success(res, data, 'Recipes retrieved');
  } catch (err) {
    next(err);
  }
};

const createRecipe = async (req, res, next) => {
  try {
    const data = await recipesService.createRecipe(req.user.id, req.body);
    return success(res, data, 'Recipe created', 201);
  } catch (err) {
    next(err);
  }
};

const getRecipe = async (req, res, next) => {
  try {
    const data = await recipesService.getRecipe(req.params.recipe_id);
    return success(res, data, 'Recipe retrieved');
  } catch (err) {
    next(err);
  }
};

const updateRecipe = async (req, res, next) => {
  try {
    const data = await recipesService.updateRecipe(req.user.id, req.params.recipe_id, req.body);
    return success(res, data, 'Recipe updated');
  } catch (err) {
    next(err);
  }
};

const deleteRecipe = async (req, res, next) => {
  try {
    await recipesService.deleteRecipe(req.user.id, req.params.recipe_id);
    return success(res, null, 'Recipe deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { listRecipes, createRecipe, getRecipe, updateRecipe, deleteRecipe };
