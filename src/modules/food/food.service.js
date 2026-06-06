const supabase = require('../../config/supabase');
const { getByBarcode } = require('../../utils/openFoodFacts');

const getCategories = async () => {
  const { data, error } = await supabase.from('food_category').select('*');
  if (error) throw new Error(error.message);
  return data;
};

const searchProducts = async ({ search, category_id, page, limit }) => {
  let query = supabase.from('food_products').select('*');
  if (search) query = query.ilike('product_name', `%${search}%`);
  if (category_id) query = query.eq('category_id', category_id);
  const from = (page - 1) * limit;
  const { data, error } = await query.range(from, from + limit - 1);
  if (error) throw new Error(error.message);
  return data;
};

const getProductById = async (productId) => {
  const { data, error } = await supabase.from('food_products').select('*').eq('product_id', productId).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
};

const findByBarcode = async (barcode) => {
  const { data, error } = await supabase.from('food_products').select('*').eq('barcode_code', barcode).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
};

const insertProduct = async (payload) => {
  const { data, error } = await supabase.from('food_products').insert(payload).select('*').maybeSingle();
  if (error) throw new Error(error.message);
  return data;
};

const getProductByBarcode = async (barcode) => {
  const localProduct = await findByBarcode(barcode);
  if (localProduct) return localProduct;

  const remoteProduct = await getByBarcode(barcode);
  if (!remoteProduct) return null;

  const newProduct = await insertProduct(remoteProduct);
  return newProduct;
};

module.exports = { getCategories, searchProducts, getProductById, getProductByBarcode };
