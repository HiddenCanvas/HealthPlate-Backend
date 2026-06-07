const { supabaseAdmin } = require('../config/supabase');

const getAllFoods = async ({ page = 1, limit = 10, category_id } = {}) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from('food_products')
    .select('*, food_category(name)', { count: 'exact' })
    .range(from, to);

  if (category_id) query = query.eq('category_id', category_id);

  const { data, error, count } = await query;
  if (error) throw { statusCode: 400, message: error.message };
  return { data, total: count, page, limit };
};

const searchFoods = async (q) => {
  const { data, error } = await supabaseAdmin
    .from('food_products')
    .select('*, food_category(name)')
    .ilike('product_name', '%' + q + '%')
    .limit(20);
  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

const getFoodByBarcode = async (code) => {
  const { data, error } = await supabaseAdmin
    .from('food_products')
    .select('*, food_category(name)')
    .eq('barcode_code', code)
    .single();
  if (error) throw { statusCode: 404, message: 'Produk tidak ditemukan.' };
  return data;
};

const getFoodById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('food_products')
    .select('*, food_category(name)')
    .eq('product_id', id)
    .single();
  if (error) throw { statusCode: 404, message: 'Produk tidak ditemukan.' };
  return data;
};

module.exports = { getAllFoods, searchFoods, getFoodByBarcode, getFoodById };
