const srv = require('../services/adminMonitoring.service');

const getUsers = async (req, res, next) => {
  try {
    const result = await srv.getUsers(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (err) { next(err); }
};

const getLogs = async (req, res, next) => {
  try {
    const result = await srv.getLogs(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (err) { next(err); }
};

module.exports = { getUsers, getLogs };
