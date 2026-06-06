const supabase = require('../config/supabase');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, data: null, message: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ success: false, data: null, message: 'Invalid token' });
    }

    req.user = {
      id: data.user.id,
      email: data.user.email
    };
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authMiddleware;
