const { z } = require('zod');

const updateUserSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional().nullable(),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  weight_kg: z.number().positive().max(500).optional().nullable(),
  height_cm: z.number().positive().max(300).optional().nullable()
});

module.exports = { updateUserSchema };
