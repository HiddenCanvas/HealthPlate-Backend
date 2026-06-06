const success = (res, data = null, message = 'OK', statusCode = 200) =>
  res.status(statusCode).json({ success: true, data, message });

const error = (res, message = 'Internal Server Error', statusCode = 500, data = null) =>
  res.status(statusCode).json({ success: false, data, message });

module.exports = { success, error };
