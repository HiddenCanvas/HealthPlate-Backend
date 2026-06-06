const { z } = require('zod');

const createBookmarkSchema = z.object({
  product_id: z.string().uuid().optional(),
  recipe_id: z.string().uuid().optional()
}).refine((data) => (data.product_id && !data.recipe_id) || (!data.product_id && data.recipe_id), {
  message: 'Either product_id or recipe_id must be provided, but not both.'
});

module.exports = { createBookmarkSchema };
