const srv = require('../services/notification.service');

const saveFcmToken = async (req, res, next) => {
  try {
    const { fcm_token } = req.body;
    const data = await srv.saveFcmToken(req.user.id, fcm_token);
    return res.status(200).json({ success: true, message: 'FCM token berhasil disimpan.', data });
  } catch (err) { next(err); }
};

const getNotifications = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const data = await srv.getNotifications(req.user.id, page, limit);
    return res.status(200).json({ success: true, ...data });
  } catch (err) { next(err); }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await srv.markAsRead(req.user.id, id);
    return res.status(200).json({ success: true, message: 'Notifikasi ditandai sudah dibaca.', data });
  } catch (err) { next(err); }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const data = await srv.markAllAsRead(req.user.id);
    return res.status(200).json({ success: true, message: 'Semua notifikasi ditandai sudah dibaca.', data });
  } catch (err) { next(err); }
};

const getSettings = async (req, res, next) => {
  try {
    const data = await srv.getPreferences(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const putSettings = async (req, res, next) => {
  try {
    const data = await srv.updatePreferences(req.user.id, req.body);
    return res.status(200).json({ success: true, message: 'Setting notifikasi berhasil diupdate.', data });
  } catch (err) { next(err); }
};

const createNotification = async (req, res, next) => {
  try {
    const data = await srv.createNotification(req.user.id, req.body);
    return res.status(201).json({ success: true, message: 'Notifikasi berhasil dibuat.', data });
  } catch (err) { next(err); }
};

module.exports = {
  saveFcmToken,
  getNotifications,
  markAsRead,
  markAllAsRead,
  getSettings,
  putSettings,
  createNotification
};
