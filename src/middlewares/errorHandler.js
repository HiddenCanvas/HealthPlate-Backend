const errorHandler = (err, req, res, next) => {
  console.error(err);
  return res.status(err.statusCode || 500).json({
    success: false,
    data: null,
    message: err.message || 'Internal Server Error'
  });
};

module.exports = errorHandler;
