const { supabaseAdmin } = require('../config/supabase');

const mapCategory = (category) => ({
  category_id: category.category_id,
  category_name: category.category_name,
  meal_packages: category.meal_packages || []
});

const getAllMealCategories = async () => {
  const { data, error } = await supabaseAdmin
    .from('meal_categories')
    .select('*, meal_packages(*)')
    .order('category_name', { ascending: true });
  if (error) throw { statusCode: 400, message: error.message };
  return (data || []).map(mapCategory);
};

const getMealCategoryById = async (categoryId) => {
  const { data, error } = await supabaseAdmin
    .from('meal_categories')
    .select('*, meal_packages(*)')
    .eq('category_id', categoryId)
    .single();
  if (error) throw { statusCode: 404, message: 'Kategori paket makan tidak ditemukan.' };
  return mapCategory(data);
};

const createMealCategory = async (body) => {
  const categoryName = body.category_name && String(body.category_name).trim();
  if (!categoryName) throw { statusCode: 400, message: 'category_name wajib diisi.' };

  const { data, error } = await supabaseAdmin
    .from('meal_categories')
    .insert({ category_name: categoryName })
    .select()
    .single();
  if (error) throw { statusCode: 400, message: error.message };
  return mapCategory(data);
};

const updateMealCategory = async (categoryId, body) => {
  const categoryName = body.category_name && String(body.category_name).trim();
  if (!categoryName) throw { statusCode: 400, message: 'category_name wajib diisi.' };

  const { data, error } = await supabaseAdmin
    .from('meal_categories')
    .update({ category_name: categoryName })
    .eq('category_id', categoryId)
    .select()
    .single();
  if (error) throw { statusCode: 400, message: error.message };
  return mapCategory(data);
};

const deleteMealCategory = async (categoryId) => {
  await getMealCategoryById(categoryId);
  const { error } = await supabaseAdmin
    .from('meal_categories')
    .delete()
    .eq('category_id', categoryId);
  if (error) throw { statusCode: 400, message: error.message };
};

const getAllMealPackages = async () => {
  const { data, error } = await supabaseAdmin
    .from('meal_packages')
    .select('*, meal_categories(category_id, category_name), meal_package_items(meal_time, recipes(recipe_name))')
    .order('package_name', { ascending: true });
  if (error) throw { statusCode: 400, message: error.message };

  const order = { 'Breakfast': 1, 'Lunch': 2, 'Dinner': 3, 'Snack': 4 };

  return (data || []).map(pkg => {
    const meals = (pkg.meal_package_items || []).map(item => ({
      meal_time: item.meal_time,
      recipe_name: item.recipes ? item.recipes.recipe_name : null
    })).sort((a, b) => (order[a.meal_time] || 99) - (order[b.meal_time] || 99));

    const { meal_package_items, ...rest } = pkg;
    return {
      ...rest,
      meals
    };
  });
};

const getMealPackageById = async (packageId) => {
  const { data, error } = await supabaseAdmin
    .from('meal_packages')
    .select('*, meal_categories(category_id, category_name), meal_package_items(meal_time, recipes(recipe_name))')
    .eq('package_id', packageId)
    .single();
  if (error) throw { statusCode: 404, message: 'Paket makan tidak ditemukan.' };

  const order = { 'Breakfast': 1, 'Lunch': 2, 'Dinner': 3, 'Snack': 4 };

  const meals = (data.meal_package_items || []).map(item => ({
    meal_time: item.meal_time,
    recipe_name: item.recipes ? item.recipes.recipe_name : null
  })).sort((a, b) => (order[a.meal_time] || 99) - (order[b.meal_time] || 99));

  const { meal_package_items, ...rest } = data;
  return {
    ...rest,
    meals
  };
};

const validateMealCategory = async (categoryId) => {
  const { data, error } = await supabaseAdmin
    .from('meal_categories')
    .select('category_id')
    .eq('category_id', categoryId)
    .single();
  if (error || !data) throw { statusCode: 400, message: 'category_id tidak valid.' };
};

const createMealPackage = async (body) => {
  const packageName = body.package_name && String(body.package_name).trim();
  if (!body.category_id || !packageName) {
    throw { statusCode: 400, message: 'category_id dan package_name wajib diisi.' };
  }
  await validateMealCategory(body.category_id);

  const { data, error } = await supabaseAdmin
    .from('meal_packages')
    .insert({
      category_id: body.category_id,
      package_name: packageName,
      description: body.description || null
    })
    .select()
    .single();
  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

const updateMealPackage = async (packageId, body) => {
  const updates = {};
  if (body.category_id !== undefined) {
    await validateMealCategory(body.category_id);
    updates.category_id = body.category_id;
  }
  if (body.package_name !== undefined) {
    const packageName = String(body.package_name).trim();
    if (!packageName) throw { statusCode: 400, message: 'package_name wajib diisi.' };
    updates.package_name = packageName;
  }
  if (body.description !== undefined) updates.description = body.description || null;

  const { data, error } = await supabaseAdmin
    .from('meal_packages')
    .update(updates)
    .eq('package_id', packageId)
    .select()
    .single();
  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

const deleteMealPackage = async (packageId) => {
  await getMealPackageById(packageId);
  const { error } = await supabaseAdmin
    .from('meal_packages')
    .delete()
    .eq('package_id', packageId);
  if (error) throw { statusCode: 400, message: error.message };
};

module.exports = {
  getAllMealCategories,
  getMealCategoryById,
  createMealCategory,
  updateMealCategory,
  deleteMealCategory,
  getAllMealPackages,
  getMealPackageById,
  createMealPackage,
  updateMealPackage,
  deleteMealPackage
};
