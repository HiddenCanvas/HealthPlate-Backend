const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ai.controller');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');

// Configure custom multer instance for AI endpoint with size limits and format checks
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format file tidak didukung. Hanya JPEG, PNG, dan WebP yang diperbolehkan.'));
    }
  }
});

router.use(authMiddleware);

// POST /api/v1/ai/predict-food
router.post(
  '/predict-food',
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
              success: false,
              message: 'Ukuran file gambar melebihi batas 5 MB.'
            });
          }
          return res.status(400).json({
            success: false,
            message: `Kesalahan upload: ${err.message}`
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || 'Gagal mengunggah gambar.'
        });
      }
      next();
    });
  },
  ctrl.predictFood
);

module.exports = router;
