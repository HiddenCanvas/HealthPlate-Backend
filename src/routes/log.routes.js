const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/log.controller');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const multer = require('multer');

// Middleware wrapper to parse multipart form-data image and handle multer errors cleanly
const handleUpload = (req, res, next) => {
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
};

router.use(authMiddleware);

router.get('/', ctrl.getAllLogs);
router.get('/:date', ctrl.getLogByDate);
router.post('/:date/entries/custom', ctrl.addCustomEntry);
router.post('/:date/entries', ctrl.addEntry);
router.post('/:date/consume-recipe', ctrl.consumeRecipe);
router.post('/:date/ai-food', handleUpload, ctrl.addAiFoodEntry);
router.delete('/:date/entries/:entryId', ctrl.deleteEntry);
router.put('/:date/water', ctrl.updateWater);

module.exports = router;
