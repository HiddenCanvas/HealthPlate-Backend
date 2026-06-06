const { success } = require('../../utils/response');
const foodService = require('./food.service');

const getCategories = async (req, res, next) => {
  try {
    const data = await foodService.getCategories();
    return success(res, data, 'Food categories retrieved');
  } catch (err) {
    next(err);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const data = await foodService.searchProducts(req.query);
    return success(res, data, 'Food products retrieved');
  } catch (err) {
    next(err);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const data = await foodService.getProductById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, data: null, message: 'Product not found' });
    }
    return success(res, data, 'Food product retrieved');
  } catch (err) {
    next(err);
  }
};

const getProductByBarcode = async (req, res, next) => {
  try {
    const data = await foodService.getProductByBarcode(req.params.barcode);
    if (!data) {
      return res.status(404).json({ success: false, data: null, message: 'Product not found' });
    }
    return success(res, data, 'Food product retrieved');
  } catch (err) {
    next(err);
  }
};

module.exports = { getCategories, getProducts, getProductById, getProductByBarcode };
