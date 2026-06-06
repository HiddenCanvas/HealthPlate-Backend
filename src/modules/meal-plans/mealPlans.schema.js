const { z } = require('zod');

const createPlanSchema = z.object({
  plan_name: z.string().min(2).max(255),
  status: z.enum(['Active', 'Inactive', 'Draft']).optional()
});

const updatePlanSchema = z.object({
  plan_name: z.string().min(2).max(255).optional(),
  status: z.enum(['Active', 'Inactive', 'Draft']).optional()
});

const createItemSchema = z.object({
  product_id: z.string().uuid(),
  meal_day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  meal_time: z.enum(['Breakfast', 'Lunch', 'Dinner', 'Snack']),
  portion: z.number().positive()
});

module.exports = { createPlanSchema, updatePlanSchema, createItemSchema };
