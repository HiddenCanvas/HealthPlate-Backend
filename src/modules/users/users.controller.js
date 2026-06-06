const { success } = require('../../utils/response');
const usersService = require('./users.service');

const getMe = async (req, res, next) => {
  try {
    const data = await usersService.getMe(req.user.id);
    return success(res, data, 'User profile retrieved');
  } catch (err) {
    next(err);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const data = await usersService.updateProfile(req.user.id, req.body);
    return success(res, data, 'User profile updated');
  } catch (err) {
    next(err);
  }
};

module.exports = { getMe, updateMe };
