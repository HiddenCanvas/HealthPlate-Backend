const srv = require('../services/log.service');

const getAllLogs = async (req, res, next) => {
  try {
    const data = await srv.getAllLogs(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const getLogByDate = async (req, res, next) => {
  try {
    const data = await srv.getLogByDate(req.user.id, req.params.date);
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const addEntry = async (req, res, next) => {
  try {
    const data = await srv.addEntry(req.user.id, req.params.date, req.body);
    return res.status(201).json({ success: true, message: 'Entry berhasil ditambahkan.', data });
  } catch (err) { next(err); }
};

const deleteEntry = async (req, res, next) => {
  try {
    await srv.deleteEntry(req.user.id, req.params.date, req.params.entryId);
    return res.status(200).json({ success: true, message: 'Entry berhasil dihapus.' });
  } catch (err) { next(err); }
};

const updateWater = async (req, res, next) => {
  try {
    const data = await srv.updateWater(req.user.id, req.params.date, req.body.total_water_ml);
    return res.status(200).json({ success: true, message: 'Air minum berhasil diupdate.', data });
  } catch (err) { next(err); }
};

module.exports = { getAllLogs, getLogByDate, addEntry, deleteEntry, updateWater };
