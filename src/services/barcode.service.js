const { supabaseAdmin } = require('../config/supabase');
const axios = require('axios');

const lookupBarcode = async (barcode) => {
  if (!barcode) {
    throw { statusCode: 400, message: 'Barcode tidak boleh kosong.' };
  }

  // 1. Cek di database lokal dulu
  const { data: localProduct } = await supabaseAdmin
    .from('food_products')
    .select('*')
    .eq('barcode_code', barcode)
    .single();

  if (localProduct) {
    return {
      barcode: localProduct.barcode_code,
      product_id: localProduct.product_id,
      product_name: localProduct.product_name,
      serving_size_g: Number(localProduct.serving_size_g),
      calories_kcal: Number(localProduct.calories_kcal),
      protein_g: Number(localProduct.protein_g),
      carbohydrate_g: Number(localProduct.carbohydrate_g),
      fat_g: Number(localProduct.fat_g),
      sugar_g: Number(localProduct.sugar_g)
    };
  }

  // 2. Fetch ke Open Food Facts API
  const response = await axios.get(
    'https://world.openfoodfacts.org/api/v0/product/' + barcode + '.json',
    { timeout: 5000 }
  );

  if (response.data.status === 0 || !response.data.product) {
    throw { statusCode: 404, message: 'Produk tidak ditemukan.' };
  }

  const p = response.data.product;
  const nutriments = p.nutriments || {};

  // 3. Simpan ke database lokal
  const newProduct = {
    barcode_code:   barcode,
    product_name:   p.product_name || p.product_name_en || 'Unknown Product',
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

  return {
    barcode: savedProduct.barcode_code,
    product_id: savedProduct.product_id,
    product_name: savedProduct.product_name,
    serving_size_g: Number(savedProduct.serving_size_g),
    calories_kcal: Number(savedProduct.calories_kcal),
    protein_g: Number(savedProduct.protein_g),
    carbohydrate_g: Number(savedProduct.carbohydrate_g),
    fat_g: Number(savedProduct.fat_g),
    sugar_g: Number(savedProduct.sugar_g)
  };
};

module.exports = { lookupBarcode };
