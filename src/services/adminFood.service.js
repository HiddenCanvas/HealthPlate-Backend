const { supabaseAdmin } = require('../config/supabase');

const OPTIONAL_COLUMN_ERRORS = [
  'description',
  'updated_at',
  'sodium_mg'
];

const isOptionalColumnError = (error) => {
  if (!error || !error.message) return false;
  const message = error.message.toLowerCase();
  return OPTIONAL_COLUMN_ERRORS.some((column) => message.includes(column));
};

const toNumber = (value, fallback = 0) => {
  if (value === undefined || value === null || value === '') return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const parseServingSize = (value) => {
  if (value === undefined || value === null || value === '') return 100;
  if (typeof value === 'number') return value;

  const parsed = parseFloat(String(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 100;
};

const mapCategory = (category) => {
  if (!category) return null;
  return {
    category_id: category.category_id,
    name: category.name,
    description: category.description || null,
    created_at: category.created_at,
    updated_at: category.updated_at || category.created_at
  };
};

const mapFoodCategory = (category) => {
  if (!category) return null;
  return {
    category_id: category.category_id || null,
    name: category.name || null
  };
};

const mapFood = (food) => {
  if (!food) return null;
  return {
    product_id: food.product_id,
    category_id: food.category_id || null,
    name: food.product_name,
    barcode: food.barcode_code || null,
    brand: food.brand_name || null,
    serving_size: food.serving_size || (food.serving_size_g !== undefined && food.serving_size_g !== null ? `${food.serving_size_g} g` : null),
    calories_kcal: Number(food.calories_kcal || 0),
    carbohydrate_g: Number(food.carbohydrate_g || 0),
    protein_g: Number(food.protein_g || 0),
    fat_g: Number(food.fat_g || 0),
    sugar_g: Number(food.sugar_g || 0),
    sodium_mg: food.sodium_mg === undefined || food.sodium_mg === null ? null : Number(food.sodium_mg),
    image_url: food.image_url || null,
    food_category: mapFoodCategory(food.food_category),
    created_at: food.created_at,
    updated_at: food.updated_at || food.created_at
  };
};

const getCategorySelect = (withOptional = true) => (
  withOptional
    ? 'category_id, name, description, created_at, updated_at'
    : 'category_id, name, created_at'
);

const getFoodSelect = (withOptional = true) => (
  withOptional
    ? '*, food_category(category_id, name)'
    : 'product_id, category_id, barcode_code, product_name, brand_name, serving_size_g, calories_kcal, sugar_g, carbohydrate_g, protein_g, fat_g, image_url, created_at, food_category(category_id, name)'
);

const runCategorySelect = async (builder) => {
  let result = await builder(getCategorySelect(true));
  if (result.error && isOptionalColumnError(result.error)) {
    result = await builder(getCategorySelect(false));
  }
  return result;
};

const runFoodSelect = async (builder) => {
  let result = await builder(getFoodSelect(true));
  if (result.error && isOptionalColumnError(result.error)) {
    result = await builder(getFoodSelect(false));
  }
  return result;
};

const getAllCategories = async () => {
  const { data, error } = await runCategorySelect((select) => supabaseAdmin
    .from('food_category')
    .select(select)
    .order('name', { ascending: true }));

  if (error) throw { statusCode: 400, message: error.message };
  return (data || []).map(mapCategory);
};

const getCategoryById = async (categoryId) => {
  const { data, error } = await runCategorySelect((select) => supabaseAdmin
    .from('food_category')
    .select(select)
    .eq('category_id', categoryId)
    .single());

  if (error) throw { statusCode: 404, message: 'Kategori makanan tidak ditemukan.' };
  return mapCategory(data);
};

const ensureUniqueCategoryName = async (name, exceptId) => {
  let query = supabaseAdmin
    .from('food_category')
    .select('category_id')
    .ilike('name', name)
    .limit(1);

  if (exceptId) query = query.neq('category_id', exceptId);

  const { data, error } = await query;
  if (error) throw { statusCode: 400, message: error.message };
  if (data && data.length > 0) throw { statusCode: 409, message: 'Nama kategori makanan sudah digunakan.' };
};

const insertCategory = async (payload, withOptional = true) => {
  const insertPayload = withOptional ? payload : { name: payload.name };
  return supabaseAdmin
    .from('food_category')
    .insert(insertPayload)
    .select(getCategorySelect(withOptional))
    .single();
};

const createCategory = async (body) => {
  const name = body.name && String(body.name).trim();
  if (!name) throw { statusCode: 400, message: 'name wajib diisi.' };

  await ensureUniqueCategoryName(name);

  const payload = {
    name,
    description: body.description || null
  };

  let { data, error } = await insertCategory(payload, true);
  if (error && isOptionalColumnError(error)) {
    ({ data, error } = await insertCategory(payload, false));
  }

  if (error) throw { statusCode: 400, message: error.message };
  return mapCategory(data);
};

const updateCategory = async (categoryId, body) => {
  const existingCategory = await getCategoryById(categoryId);

  const updates = {};
  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) throw { statusCode: 400, message: 'name wajib diisi.' };
    await ensureUniqueCategoryName(name, categoryId);
    updates.name = name;
  }
  if (body.description !== undefined) updates.description = body.description || null;
  updates.updated_at = new Date().toISOString();

  let { data, error } = await supabaseAdmin
    .from('food_category')
    .update(updates)
    .eq('category_id', categoryId)
    .select(getCategorySelect(true))
    .single();

  if (error && isOptionalColumnError(error)) {
    const fallbackUpdates = {};
    if (updates.name !== undefined) fallbackUpdates.name = updates.name;

    if (Object.keys(fallbackUpdates).length === 0) return existingCategory;

    ({ data, error } = await supabaseAdmin
      .from('food_category')
      .update(fallbackUpdates)
      .eq('category_id', categoryId)
      .select(getCategorySelect(false))
      .single());
  }

  if (error) throw { statusCode: 400, message: error.message };
  return mapCategory(data);
};

const deleteCategory = async (categoryId) => {
  await getCategoryById(categoryId);

  const { count, error: countError } = await supabaseAdmin
    .from('food_products')
    .select('product_id', { count: 'exact', head: true })
    .eq('category_id', categoryId);

  if (countError) throw { statusCode: 400, message: countError.message };
  if (count > 0) {
    throw { statusCode: 409, message: 'Kategori tidak bisa dihapus karena masih digunakan oleh data makanan.' };
  }

  const { error } = await supabaseAdmin
    .from('food_category')
    .delete()
    .eq('category_id', categoryId);

  if (error) throw { statusCode: 400, message: error.message };
};

const validateCategoryExists = async (categoryId) => {
  if (!categoryId) return;

  const { data, error } = await supabaseAdmin
    .from('food_category')
    .select('category_id')
    .eq('category_id', categoryId)
    .single();

  if (error || !data) throw { statusCode: 400, message: 'category_id tidak valid.' };
};

const ensureUniqueBarcode = async (barcode, exceptId) => {
  if (!barcode) return;

  let query = supabaseAdmin
    .from('food_products')
    .select('product_id')
    .eq('barcode_code', barcode)
    .limit(1);

  if (exceptId) query = query.neq('product_id', exceptId);

  const { data, error } = await query;
  if (error) throw { statusCode: 400, message: error.message };
  if (data && data.length > 0) throw { statusCode: 409, message: 'Barcode sudah digunakan oleh makanan lain.' };
};

const buildFoodPayload = (body, isCreate = false) => {
  const payload = {};

  if (isCreate || body.name !== undefined) {
    const name = body.name && String(body.name).trim();
    if (!name) throw { statusCode: 400, message: 'name wajib diisi.' };
    payload.product_name = name;
  }

  if (body.category_id !== undefined) payload.category_id = body.category_id || null;
  if (body.barcode !== undefined) payload.barcode_code = body.barcode || null;
  if (body.brand !== undefined) payload.brand_name = body.brand || null;
  if (body.serving_size !== undefined) payload.serving_size_g = parseServingSize(body.serving_size);
  if (body.calories_kcal !== undefined || isCreate) payload.calories_kcal = toNumber(body.calories_kcal);
  if (body.carbohydrate_g !== undefined || isCreate) payload.carbohydrate_g = toNumber(body.carbohydrate_g);
  if (body.protein_g !== undefined || isCreate) payload.protein_g = toNumber(body.protein_g);
  if (body.fat_g !== undefined || isCreate) payload.fat_g = toNumber(body.fat_g);
  if (body.sugar_g !== undefined || isCreate) payload.sugar_g = toNumber(body.sugar_g);
  if (body.sodium_mg !== undefined) payload.sodium_mg = body.sodium_mg === null || body.sodium_mg === '' ? null : toNumber(body.sodium_mg, null);
  if (body.image_url !== undefined) payload.image_url = body.image_url || null;

  return payload;
};

const getAllFoods = async ({ page = 1, limit = 10, category_id, q } = {}) => {
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const from = (safePage - 1) * safeLimit;
  const to = from + safeLimit - 1;

  const buildQuery = (select) => {
    let query = supabaseAdmin
      .from('food_products')
      .select(select, { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false });

    if (category_id) query = query.eq('category_id', category_id);
    if (q) {
      const search = String(q).replace(/[%(),]/g, '');
      query = query.or(`product_name.ilike.%${search}%,barcode_code.ilike.%${search}%`);
    }

    return query;
  };

  const { data, error, count } = await runFoodSelect(buildQuery);
  if (error) throw { statusCode: 400, message: error.message };

  return {
    data: (data || []).map(mapFood),
    total: count || 0,
    page: safePage,
    limit: safeLimit
  };
};

const getFoodById = async (productId) => {
  const { data, error } = await runFoodSelect((select) => supabaseAdmin
    .from('food_products')
    .select(select)
    .eq('product_id', productId)
    .single());

  if (error) throw { statusCode: 404, message: 'Makanan tidak ditemukan.' };
  return mapFood(data);
};

const insertFood = async (payload, withOptional = true) => {
  const insertPayload = { ...payload };
  if (!withOptional) {
    delete insertPayload.sodium_mg;
    delete insertPayload.updated_at;
  }

  return supabaseAdmin
    .from('food_products')
    .insert(insertPayload)
    .select(getFoodSelect(withOptional))
    .single();
};

const createFood = async (body) => {
  await validateCategoryExists(body.category_id);
  await ensureUniqueBarcode(body.barcode);

  const payload = buildFoodPayload(body, true);

  let { data, error } = await insertFood(payload, true);
  if (error && isOptionalColumnError(error)) {
    ({ data, error } = await insertFood(payload, false));
  }

  if (error) throw { statusCode: 400, message: error.message };
  return mapFood(data);
};

const updateFood = async (productId, body) => {
  const existingFood = await getFoodById(productId);
  await validateCategoryExists(body.category_id);
  await ensureUniqueBarcode(body.barcode, productId);

  const updates = buildFoodPayload(body, false);
  updates.updated_at = new Date().toISOString();

  let { data, error } = await supabaseAdmin
    .from('food_products')
    .update(updates)
    .eq('product_id', productId)
    .select(getFoodSelect(true))
    .single();

  if (error && isOptionalColumnError(error)) {
    const fallbackUpdates = { ...updates };
    delete fallbackUpdates.sodium_mg;
    delete fallbackUpdates.updated_at;

    if (Object.keys(fallbackUpdates).length === 0) return existingFood;

    ({ data, error } = await supabaseAdmin
      .from('food_products')
      .update(fallbackUpdates)
      .eq('product_id', productId)
      .select(getFoodSelect(false))
      .single());
  }

  if (error) throw { statusCode: 400, message: error.message };
  return mapFood(data);
};

const deleteFood = async (productId) => {
  await getFoodById(productId);

  const { count: ingredientCount, error: ingredientError } = await supabaseAdmin
    .from('bahan_resep')
    .select('bahan_id', { count: 'exact', head: true })
    .eq('product_id', productId);

  if (ingredientError) throw { statusCode: 400, message: ingredientError.message };
  if (ingredientCount > 0) {
    throw { statusCode: 409, message: 'Makanan tidak bisa dihapus karena masih dipakai pada bahan resep.' };
  }

  const { count: logCount, error: logError } = await supabaseAdmin
    .from('log_entries')
    .select('entry_id', { count: 'exact', head: true })
    .eq('product_id', productId);

  if (logError) throw { statusCode: 400, message: logError.message };
  if (logCount > 0) {
    throw { statusCode: 409, message: 'Makanan tidak bisa dihapus karena masih dipakai pada log makanan.' };
  }

  const { error } = await supabaseAdmin
    .from('food_products')
    .delete()
    .eq('product_id', productId);

  if (error) throw { statusCode: 400, message: error.message };
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood
};
