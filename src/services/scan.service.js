const { supabaseAdmin } = require('../config/supabase');
const axios = require('axios');

const scanBarcode = async (barcode) => {
  // 1. Cek di database lokal dulu
  const { data: localProduct } = await supabaseAdmin
    .from('food_products')
    .select('*, food_category(name)')
    .eq('barcode_code', barcode)
    .single();

  if (localProduct) return { source: 'local', data: localProduct };

  // 2. Fetch ke Open Food Facts API
  const response = await axios.get(
    'https://world.openfoodfacts.org/api/v0/product/' + barcode + '.json',
    { timeout: 5000 }
  );

  if (response.data.status === 0)
    throw { statusCode: 404, message: 'Produk tidak ditemukan.' };

  const p = response.data.product;
  const nutriments = p.nutriments || {};

  // 3. Simpan ke database lokal termasuk gambar
  const newProduct = {
    barcode_code:   barcode,
    product_name:   p.product_name || p.product_name_en || 'Unknown',
    brand_name:     p.brands || null,
    serving_size_g: parseFloat(p.serving_size) || 100,
    calories_kcal:  parseFloat(nutriments['energy-kcal_100g']) || 0,
    sugar_g:        parseFloat(nutriments['sugars_100g'])      || 0,
    carbohydrate_g: parseFloat(nutriments['carbohydrates_100g']) || 0,
    protein_g:      parseFloat(nutriments['proteins_100g'])    || 0,
    fat_g:          parseFloat(nutriments['fat_100g'])         || 0,
    image_url:      p.image_front_url || p.image_url || null,
  };

  const { data: savedProduct, error } = await supabaseAdmin
    .from('food_products')
    .insert(newProduct)
    .select()
    .single();

  if (error) throw { statusCode: 400, message: error.message };

  return { source: 'openfoodfacts', data: savedProduct };
};

module.exports = { scanBarcode };
