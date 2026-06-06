const { success } = require('../../utils/response');
const logsService = require('./logs.service');

const getDaily = async (req, res, next) => {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const data = await logsService.getDailyLog(req.user.id, date);
    return success(res, data, 'Daily log retrieved');
  } catch (err) {
    next(err);
  }
};

const addEntry = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    const data = await logsService.addEntry(req.user.id, payload);
    return success(res, data, 'Log entry added');
  } catch (err) {
    next(err);
  }
};

const deleteEntry = async (req, res, next) => {
  try {
    await logsService.deleteEntry(req.user.id, req.params.entry_id);
    return success(res, null, 'Log entry deleted');
  } catch (err) {
    next(err);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const data = await logsService.getHistory(req.user.id, req.query);
    return success(res, data, 'Daily history retrieved');
  } catch (err) {
    next(err);
  }
};

module.exports = { getDaily, addEntry, deleteEntry, getHistory };
