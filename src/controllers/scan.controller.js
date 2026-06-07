const srv = require('../services/scan.service');

const scanBarcode = async (req, res, next) => {
  try {
    const { barcode } = req.body;
    if (!barcode)
      return res.status(400).json({ success: false, message: 'Barcode wajib diisi.' });
    const result = await srv.scanBarcode(barcode);
    return res.status(200).json({ success: true, ...result });
  } catch (err) { next(err); }
};

module.exports = { scanBarcode };
