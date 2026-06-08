const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { supabaseAdmin } = require('../config/supabase');

router.use(authMiddleware);

// Flutter kirim FCM token setelah login
router.post('/fcm-token', async (req, res, next) => {
  try {
    const { fcm_token } = req.body;
    if (!fcm_token)
      return res.status(400).json({ success: false, message: 'fcm_token wajib diisi.' });
    await supabaseAdmin.from('users').update({ fcm_token }).eq('user_id', req.user.id);
    return res.status(200).json({ success: true, message: 'FCM token berhasil disimpan.' });
  } catch (err) { next(err); }
});

// Ambil semua notifikasi user
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

// Tandai notifikasi sudah dibaca
router.put('/:id/read', async (req, res, next) => {
  try {
    await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('notification_id', req.params.id)
      .eq('user_id', req.user.id);
    return res.status(200).json({ success: true, message: 'Notifikasi ditandai sudah dibaca.' });
  } catch (err) { next(err); }
});

module.exports = router;
