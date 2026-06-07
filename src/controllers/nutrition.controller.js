const srv = require('../services/nutrition.service');

const getAllFoods = async (req, res, next) => {
  try {
    const { page, limit, category_id } = req.query;
    const result = await srv.getAllFoods({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      category_id
    });
    return res.status(200).json({ success: true, ...result });
  } catch (err) { next(err); }
};

const searchFoods = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Query pencarian wajib diisi.' });
    const data = await srv.searchFoods(q);
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const getFoodByBarcode = async (req, res, next) => {
  try {
    const data = await srv.getFoodByBarcode(req.params.code);
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const getFoodById = async (req, res, next) => {
  try {
    const data = await srv.getFoodById(req.params.id);
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = { getAllFoods, searchFoods, getFoodByBarcode, getFoodById };
