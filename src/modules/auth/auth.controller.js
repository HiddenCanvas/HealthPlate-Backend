const { success } = require('../../utils/response');
const authService = require('./auth.service');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return success(res, result, 'User registered successfully', 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return success(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user.id);
    return success(res, null, 'Logout successful');
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const result = await authService.refreshToken(req.body);
    return success(res, result, 'Token refreshed successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, refresh };
