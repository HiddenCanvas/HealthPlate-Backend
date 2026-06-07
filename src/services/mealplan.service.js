const { supabaseAdmin } = require('../config/supabase');

const getAllMealPlans = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('meal_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

const createMealPlan = async (userId, { plan_name, status = 'Draft' }) => {
  if (!plan_name) throw { statusCode: 400, message: 'plan_name wajib diisi.' };
  const { data, error } = await supabaseAdmin
    .from('meal_plans')
    .insert({ user_id: userId, plan_name, status })
    .select()
    .single();
  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

const getMealPlanById = async (userId, planId) => {
  const { data, error } = await supabaseAdmin
    .from('meal_plans')
    .select('*, meal_plan_items(*, food_products(product_name, brand_name, calories_kcal, protein_g, carbohydrate_g, fat_g, serving_size_g))')
    .eq('plan_id', planId)
    .eq('user_id', userId)
    .single();
  if (error) throw { statusCode: 404, message: 'Meal plan tidak ditemukan.' };
  return data;
};

const updateMealPlan = async (userId, planId, body) => {
  const allowed = ['plan_name', 'status'];
  const updates = {};
  allowed.forEach(k => { if (body[k] !== undefined) updates[k] = body[k]; });

  const { data, error } = await supabaseAdmin
    .from('meal_plans')
    .update(updates)
    .eq('plan_id', planId)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

const deleteMealPlan = async (userId, planId) => {
  const { error } = await supabaseAdmin
    .from('meal_plans')
    .delete()
    .eq('plan_id', planId)
    .eq('user_id', userId);
  if (error) throw { statusCode: 400, message: error.message };
};

const addItem = async (userId, planId, body) => {
  const { product_id, meal_day, meal_time, portion } = body;
  if (!product_id || !meal_day || !meal_time || !portion)
    throw { statusCode: 400, message: 'product_id, meal_day, meal_time, dan portion wajib diisi.' };

  // Pastikan meal plan milik user
  const { data: plan, error: planError } = await supabaseAdmin
    .from('meal_plans')
    .select('plan_id')
    .eq('plan_id', planId)
    .eq('user_id', userId)
    .single();
  if (planError || !plan) throw { statusCode: 404, message: 'Meal plan tidak ditemukan.' };

  const { data, error } = await supabaseAdmin
    .from('meal_plan_items')
    .insert({ plan_id: planId, product_id, meal_day, meal_time, portion })
    .select()
    .single();
  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

const deleteItem = async (userId, planId, itemId) => {
  // Pastikan meal plan milik user
  const { data: plan, error: planError } = await supabaseAdmin
    .from('meal_plans')
    .select('plan_id')
    .eq('plan_id', planId)
    .eq('user_id', userId)
    .single();
  if (planError || !plan) throw { statusCode: 404, message: 'Meal plan tidak ditemukan.' };

  const { error } = await supabaseAdmin
    .from('meal_plan_items')
    .delete()
    .eq('item_id', itemId)
    .eq('plan_id', planId);
  if (error) throw { statusCode: 400, message: error.message };
};

module.exports = { getAllMealPlans, createMealPlan, getMealPlanById, updateMealPlan, deleteMealPlan, addItem, deleteItem };
