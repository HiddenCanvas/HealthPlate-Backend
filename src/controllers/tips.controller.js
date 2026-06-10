const srv = require('../services/tips.service');

const getAllTips = async (req, res, next) => {
  try {
    const { page, limit, category } = req.query;
    const result = await srv.getAllTips({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      category
    });
    return res.status(200).json({ success: true, ...result });
  } catch (err) { next(err); }
};

const getTipById = async (req, res, next) => {
  try {
    const data = await srv.getTipById(req.params.id);
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const createTip = async (req, res, next) => {
  try {
    const data = await srv.createTip(req.user.id, req.body);
    return res.status(201).json({ success: true, message: 'Tips berhasil dibuat.', data });
  } catch (err) { next(err); }
};

const updateTip = async (req, res, next) => {
  try {
    const data = await srv.updateTip(req.user.id, req.params.id, req.body);
    return res.status(200).json({ success: true, message: 'Tips berhasil diupdate.', data });
  } catch (err) { next(err); }
};

const deleteTip = async (req, res, next) => {
  try {
    await srv.deleteTip(req.user.id, req.params.id);
    return res.status(200).json({ success: true, message: 'Tips berhasil dihapus.' });
  } catch (err) { next(err); }
};

module.exports = { getAllTips, getTipById, createTip, updateTip, deleteTip };