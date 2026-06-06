const { z } = require('zod');

const productsQuerySchema = z.object({
  search: z.string().optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
});

module.exports = { productsQuerySchema };
