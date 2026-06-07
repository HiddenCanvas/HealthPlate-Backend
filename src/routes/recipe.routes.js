const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/recipe.controller');
const authMiddleware = require('../middleware/auth');

router.get('/', ctrl.getAllRecipes);
router.get('/:id', ctrl.getRecipeById);
router.post('/', authMiddleware, ctrl.createRecipe);
router.put('/:id', authMiddleware, ctrl.updateRecipe);
router.delete('/:id', authMiddleware, ctrl.deleteRecipe);
router.post('/:id/ingredients', authMiddleware, ctrl.addIngredient);
router.delete('/:id/ingredients/:bahanId', authMiddleware, ctrl.deleteIngredient);

module.exports = router;
