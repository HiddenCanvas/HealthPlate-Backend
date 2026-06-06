const { z } = require('zod');

const addEntrySchema = z.object({
  product_id: z.string().uuid(),
  meal_time: z.enum(['Breakfast', 'Lunch', 'Dinner', 'Snack']),
  portion: z.number().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

const historyQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(30)
});

module.exports = { addEntrySchema, historyQuerySchema };
