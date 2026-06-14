const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.jpeg', '.jpg', '.png', '.webp'];
    const fileExt = file.originalname ? path.extname(file.originalname).toLowerCase() : '';
    
    if (file.mimetype.startsWith('image/') || allowedExtensions.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file gambar yang diperbolehkan.'), false);
    }
  }
});

module.exports = upload;
