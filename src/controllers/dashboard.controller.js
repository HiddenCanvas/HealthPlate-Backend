const srv = require('../services/dashboard.service');

const getSummary = async (req, res, next) => {
  try {
    const data = await srv.getSummary(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const getHistory = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const data = await srv.getHistory(req.user.id, days);
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = { getSummary, getHistory };