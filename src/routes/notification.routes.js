const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { supabaseAdmin } = require('../config/supabase');
const settingsSrv = require('../services/notification.settings.service');

router.use(authMiddleware);

// ── FCM Token ──────────────────────────────────────────────
router.post('/fcm-token', async (req, res, next) => {
  try {
    const { fcm_token } = req.body;
    if (!fcm_token)
      return res.status(400).json({ success: false, message: 'fcm_token wajib diisi.' });

    const { error } = await supabaseAdmin
      .from('users')
      .update({ fcm_token })
      .eq('user_id', req.user.id);

    if (error) throw { statusCode: 400, message: error.message };
    return res.status(200).json({ success: true, message: 'FCM token berhasil disimpan.' });
  } catch (err) { next(err); }
});

// ── Notification Settings ──────────────────────────────────

// GET semua settings milik user
router.get('/settings', async (req, res, next) => {
  try {
    const data = await settingsSrv.getSettings(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
});

// PUT update setting berdasarkan type (breakfast/lunch/dinner/water)
// Body: { hour, minute, custom_message, is_enabled }
router.put('/settings/:type', async (req, res, next) => {
  try {
    const data = await settingsSrv.updateSetting(req.user.id, req.params.type, req.body);
    return res.status(200).json({ success: true, message: 'Setting notifikasi berhasil diupdate.', data });
  } catch (err) { next(err); }
});

// POST reset semua settings ke default
router.post('/settings/reset', async (req, res, next) => {
  try {
    const data = await settingsSrv.resetSettings(req.user.id);
    return res.status(200).json({ success: true, message: 'Setting notifikasi direset ke default.', data });
  } catch (err) { next(err); }
});

// ── Notifications CRUD ─────────────────────────────────────

router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw { statusCode: 400, message: error.message };
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
});

router.put('/read-all', async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', req.user.id)
      .eq('is_read', false);

    if (error) throw { statusCode: 400, message: error.message };
    return res.status(200).json({ success: true, message: 'Semua notifikasi ditandai sudah dibaca.' });
  } catch (err) { next(err); }
});

router.put('/:id/read', async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('notification_id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw { statusCode: 400, message: error.message };
    return res.status(200).json({ success: true, message: 'Notifikasi ditandai sudah dibaca.' });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('notification_id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw { statusCode: 400, message: error.message };
    return res.status(200).json({ success: true, message: 'Notifikasi berhasil dihapus.' });
  } catch (err) { next(err); }
});

module.exports = router;
