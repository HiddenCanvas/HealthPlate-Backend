const express = require('express');
const validate = require('../../middlewares/validate.middleware');
const { createRecipeSchema, updateRecipeSchema } = require('./recipes.schema');
const recipesController = require('./recipes.controller');

const router = express.Router();

router.get('/', recipesController.listRecipes);
router.post('/', validate(createRecipeSchema), recipesController.createRecipe);
router.get('/:recipe_id', recipesController.getRecipe);
router.put('/:recipe_id', validate(updateRecipeSchema), recipesController.updateRecipe);
router.delete('/:recipe_id', recipesController.deleteRecipe);

module.exports = router;
