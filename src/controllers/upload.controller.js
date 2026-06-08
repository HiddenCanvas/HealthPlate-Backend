const srv = require('../services/upload.service');

const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: 'File gambar wajib diupload.' });
    const data = await srv.updateAvatar(req.user.id, req.file);
    return res.status(200).json({ success: true, message: 'Avatar berhasil diupdate.', data });
  } catch (err) { next(err); }
};

const uploadRecipeImage = async (req, res, next) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: 'File gambar wajib diupload.' });
    const data = await srv.updateRecipeImage(req.user.id, req.params.id, req.file);
    return res.status(200).json({ success: true, message: 'Foto resep berhasil diupdate.', data });
  } catch (err) { next(err); }
};

module.exports = { uploadAvatar, uploadRecipeImage };
