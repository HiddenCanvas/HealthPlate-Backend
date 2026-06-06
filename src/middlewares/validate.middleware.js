const { error } = require('../utils/response');

const validate = (schema, property = 'body') => (req, res, next) => {
  const parseTarget = req[property];
  const parsed = schema.safeParse(parseTarget);
  if (!parsed.success) {
    return error(res, parsed.error.errors.map((err) => err.message).join(', '), 400);
  }

  req[property] = parsed.data;
  next();
};

module.exports = validate;
