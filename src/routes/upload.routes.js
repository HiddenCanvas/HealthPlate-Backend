const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/upload.controller');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const multer = require('multer');

router.use(authMiddleware);

// Middleware wrapper to parse any field name and handle multer errors cleanly
const handleUpload = (req, res, next) => {
  upload.any()(req, res, (err) => {
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
    
    // Fallback req.file to the first uploaded file in req.files
    if (req.files && req.files.length > 0) {
      req.file = req.files[0];
    }
    
    next();
  });
};

router.post('/avatar', handleUpload, ctrl.uploadAvatar);
router.post('/recipe/:id', handleUpload, ctrl.uploadRecipeImage);
router.post('/consumption-photo', handleUpload, ctrl.uploadConsumptionPhoto);

module.exports = router;
