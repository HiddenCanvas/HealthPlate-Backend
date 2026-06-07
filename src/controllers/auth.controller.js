const srv = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email, dan password wajib diisi.' });
    const data = await srv.register({ name, email, password });
    return res.status(201).json({ success: true, message: 'Registrasi berhasil. Cek email untuk verifikasi.', data });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email dan password wajib diisi.' });
    const data = await srv.login({ email, password });
    return res.status(200).json({ success: true, message: 'Login berhasil.', data });
  } catch (err) { next(err); }
};

const logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    await srv.logout(token);
    return res.status(200).json({ success: true, message: 'Logout berhasil.' });
  } catch (err) { next(err); }
};

const getMe = async (req, res, next) => {
  try {
    const data = await srv.getMe(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const updateMe = async (req, res, next) => {
  try {
    const data = await srv.updateMe(req.user.id, req.body);
    return res.status(200).json({ success: true, message: 'Profile berhasil diupdate.', data });
  } catch (err) { next(err); }
};

module.exports = { register, login, logout, getMe, updateMe };