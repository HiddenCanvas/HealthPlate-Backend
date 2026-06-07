const { supabaseAdmin } = require('../config/supabase');

const getAllRecipes = async () => {
  const { data, error } = await supabaseAdmin
    .from('recipes')
    .select('*, users(name), bahan_resep(*, food_products(product_name, serving_size_g, calories_kcal))')
    .order('created_at', { ascending: false });
  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

const getRecipeById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('recipes')
    .select('*, users(name), bahan_resep(*, food_products(product_name, serving_size_g, calories_kcal, protein_g, carbohydrate_g, fat_g))')
    .eq('recipe_id', id)
    .single();
  if (error) throw { statusCode: 404, message: 'Resep tidak ditemukan.' };
  return data;
};

const createRecipe = async (userId, body) => {
  const { recipe_name, description, instructions } = body;
  if (!recipe_name || !instructions)
    throw { statusCode: 400, message: 'recipe_name dan instructions wajib diisi.' };

  const { data, error } = await supabaseAdmin
    .from('recipes')
    .insert({ user_id: userId, recipe_name, description, instructions })
    .select()
    .single();
  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

const updateRecipe = async (userId, recipeId, body) => {
  const allowed = ['recipe_name', 'description', 'instructions'];
  const updates = {};
  allowed.forEach(k => { if (body[k] !== undefined) updates[k] = body[k]; });
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('recipes')
    .update(updates)
    .eq('recipe_id', recipeId)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

const deleteRecipe = async (userId, recipeId) => {
  const { error } = await supabaseAdmin
    .from('recipes')
    .delete()
    .eq('recipe_id', recipeId)
    .eq('user_id', userId);
  if (error) throw { statusCode: 400, message: error.message };
};

const addIngredient = async (userId, recipeId, body) => {
  const { product_id, quantity, unit } = body;
  if (!product_id || !quantity || !unit)
    throw { statusCode: 400, message: 'product_id, quantity, dan unit wajib diisi.' };

  // Pastikan resep milik user
  const { data: recipe, error: recipeError } = await supabaseAdmin
    .from('recipes')
    .select('recipe_id')
    .eq('recipe_id', recipeId)
    .eq('user_id', userId)
    .single();
  if (recipeError || !recipe) throw { statusCode: 404, message: 'Resep tidak ditemukan.' };

  const { data, error } = await supabaseAdmin
    .from('bahan_resep')
    .insert({ recipe_id: recipeId, product_id, quantity, unit })
    .select()
    .single();
  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

const deleteIngredient = async (userId, recipeId, bahanId) => {
  // Pastikan resep milik user
  const { data: recipe, error: recipeError } = await supabaseAdmin
    .from('recipes')
    .select('recipe_id')
    .eq('recipe_id', recipeId)
    .eq('user_id', userId)
    .single();
  if (recipeError || !recipe) throw { statusCode: 404, message: 'Resep tidak ditemukan.' };

  const { error } = await supabaseAdmin
    .from('bahan_resep')
    .delete()
    .eq('bahan_id', bahanId)
    .eq('recipe_id', recipeId);
  if (error) throw { statusCode: 400, message: error.message };
};

module.exports = { getAllRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe, addIngredient, deleteIngredient };
