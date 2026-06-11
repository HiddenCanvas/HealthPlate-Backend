const { supabaseAdmin } = require('../config/supabase');

// Helper: derive meal_day dari meal_date kalau tidak dikirim
const getDayName = (dateStr) => {
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  return days[new Date(dateStr).getDay()];
};

const getAllMealPlans = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('meal_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

const createMealPlan = async (userId, { plan_name, status = 'Draft', activated_at, expires_at }) => {
  if (!plan_name) throw { statusCode: 400, message: 'plan_name wajib diisi.' };

  const payload = { user_id: userId, plan_name, status };
  if (activated_at) payload.activated_at = activated_at;
  if (expires_at)   payload.expires_at   = expires_at;

  const { data, error } = await supabaseAdmin
    .from('meal_plans')
    .insert(payload)
    .select()
    .single();
  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

const getMealPlanById = async (userId, planId) => {
  const { data, error } = await supabaseAdmin
    .from('meal_plans')
    .select('*, meal_plan_items(*, recipes(recipe_name, image_url, cooking_time, difficulty, calories_kcal, protein_g, carbohydrate_g, fat_g, sugar_g, bahan_resep(quantity, unit, food_products(product_name)), recipe_steps(step_number, instruction)))')
    .eq('plan_id', planId)
    .eq('user_id', userId)
    .single();
    
  if (error) throw { statusCode: 404, message: 'Meal plan tidak ditemukan.' };
  
  // Urutkan recipe_steps jika ada
  if (data.meal_plan_items) {
    data.meal_plan_items.forEach(item => {
      if (item.recipes && item.recipes.recipe_steps) {
        item.recipes.recipe_steps.sort((a, b) => a.step_number - b.step_number);
      }
    });
  }
  
  return data;
};

// GET meal plan berdasarkan tanggal tertentu
const getMealPlanByDate = async (userId, date) => {
  // Cari meal plan yang aktif pada tanggal tersebut
  const { data: plans, error: planError } = await supabaseAdmin
    .from('meal_plans')
    .select('plan_id, plan_name, status, activated_at, expires_at')
    .eq('user_id', userId)
    .lte('activated_at', date)
    .gte('expires_at', date);

  if (planError) throw { statusCode: 400, message: planError.message };

  if (!plans || plans.length === 0) return { date, plans: [], items: [] };

  const planIds = plans.map(p => p.plan_id);

  // Ambil items untuk tanggal tersebut
  const { data: items, error: itemError } = await supabaseAdmin
    .from('meal_plan_items')
    .select('*, recipes(recipe_name, image_url, cooking_time, difficulty, calories_kcal, protein_g, carbohydrate_g, fat_g, sugar_g, bahan_resep(quantity, unit, food_products(product_name)), recipe_steps(step_number, instruction))')
    .in('plan_id', planIds)
    .eq('meal_date', date)
    .order('meal_time');

  if (itemError) throw { statusCode: 400, message: itemError.message };

  // Urutkan recipe_steps jika ada
  if (items) {
    items.forEach(item => {
      if (item.recipes && item.recipes.recipe_steps) {
        item.recipes.recipe_steps.sort((a, b) => a.step_number - b.step_number);
      }
    });
  }

  return { date, plans, items: items || [] };
};

const updateMealPlan = async (userId, planId, body) => {
  const allowed = ['plan_name', 'status', 'activated_at', 'expires_at'];
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

// Tambah item untuk 1 hari spesifik (meal_date wajib)
const addItem = async (userId, planId, body) => {
  const { recipe_id, meal_date, meal_time, portion, meal_day } = body;

  if (!recipe_id || !meal_date || !meal_time || !portion)
    throw { statusCode: 400, message: 'recipe_id, meal_date, meal_time, dan portion wajib diisi.' };

  // Validasi format tanggal
  if (isNaN(new Date(meal_date).getTime()))
    throw { statusCode: 400, message: 'Format meal_date tidak valid. Gunakan YYYY-MM-DD.' };

  // Ownership check
  const { data: plan, error: planError } = await supabaseAdmin
    .from('meal_plans')
    .select('plan_id')
    .eq('plan_id', planId)
    .eq('user_id', userId)
    .single();
  if (planError || !plan) throw { statusCode: 404, message: 'Meal plan tidak ditemukan.' };

  // Validasi apakah resep exists
  const { data: recipe, error: recipeErr } = await supabaseAdmin
    .from('recipes')
    .select('recipe_id')
    .eq('recipe_id', recipe_id)
    .single();
  if (recipeErr || !recipe) throw { statusCode: 400, message: 'Resep tidak ditemukan.' };

  // Auto-derive meal_day dari meal_date kalau tidak dikirim
  const resolvedMealDay = meal_day || getDayName(meal_date);

  const { data, error } = await supabaseAdmin
    .from('meal_plan_items')
    .insert({ plan_id: planId, recipe_id, meal_date, meal_day: resolvedMealDay, meal_time, portion })
    .select()
    .single();
  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

// Hapus item spesifik — tidak mempengaruhi item hari lain
const deleteItem = async (userId, planId, itemId) => {
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

// Hapus SEMUA item pada tanggal tertentu saja
const deleteItemsByDate = async (userId, planId, date) => {
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
    .eq('plan_id', planId)
    .eq('meal_date', date);
  if (error) throw { statusCode: 400, message: error.message };
};

module.exports = {
  getAllMealPlans, createMealPlan, getMealPlanById, getMealPlanByDate,
  updateMealPlan, deleteMealPlan, addItem, deleteItem, deleteItemsByDate
};
