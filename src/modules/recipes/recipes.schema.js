const { z } = require('zod');

const recipeItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().positive(),
  unit: z.string().min(1).max(50)
});

const createRecipeSchema = z.object({
  recipe_name: z.string().min(2).max(255),
  description: z.string().optional().nullable(),
  instructions: z.string().min(1),
  ingredients: z.array(recipeItemSchema)
});

const updateRecipeSchema = z.object({
  recipe_name: z.string().min(2).max(255).optional(),
  description: z.string().optional().nullable(),
  instructions: z.string().optional(),
  ingredients: z.array(recipeItemSchema).optional()
});

module.exports = { createRecipeSchema, updateRecipeSchema };
