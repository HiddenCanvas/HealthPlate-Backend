const srv = require('../services/barcode.service');

const lookupBarcode = async (req, res, next) => {
  try {
    const { barcode } = req.params;
    if (!barcode) {
      return res.status(400).json({ success: false, message: 'Barcode tidak boleh kosong.' });
    }
    const data = await srv.lookupBarcode(barcode);
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = { lookupBarcode };
