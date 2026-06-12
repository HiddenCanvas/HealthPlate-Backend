const authMiddleware = require('./auth');
const { supabaseAdmin } = require('../config/supabase');

module.exports = async (req, res, next) => {
  authMiddleware(req, res, async (authError) => {
    if (authError) return next(authError);

    try {
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('user_id, role')
        .eq('user_id', req.user.id)
        .single();

      if (error || !user) {
        return res.status(403).json({ success: false, message: 'User tidak ditemukan.' });
      }

      if (user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Akses admin diperlukan.' });
      }

      req.admin = user;
      next();
    } catch (error) {
      next(error);
    }
  });
};
