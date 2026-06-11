const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/recipe.controller');
const authMiddleware = require('../middleware/auth');

router.get('/categories', ctrl.getCategories);
router.get('/search', ctrl.searchRecipes);

router.get('/', ctrl.getAllRecipes);
router.get('/:id', ctrl.getRecipeById);
router.post('/', authMiddleware, ctrl.createRecipe);
router.put('/:id', authMiddleware, ctrl.updateRecipe);
router.delete('/:id', authMiddleware, ctrl.deleteRecipe);

router.post('/:id/ingredients', authMiddleware, ctrl.addIngredient);
router.delete('/:id/ingredients/:bahanId', authMiddleware, ctrl.deleteIngredient);

router.post('/:id/steps', authMiddleware, ctrl.addStep);
router.delete('/:id/steps/:stepId', authMiddleware, ctrl.deleteStep);

module.exports = router;
