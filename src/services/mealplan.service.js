const { supabaseAdmin } = require('../config/supabase');

// Helper: derive meal_day dari meal_date kalau tidak dikirim
const getDayName = (dateStr) => {
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  return days[new Date(dateStr).getDay()];
};

const mapMealPlan = (plan) => {
  if (!plan) return null;

  const items = plan.meal_plan_items || plan.items || [];

  return {
    ...plan,
    items: items.map(item => ({
      item_id: item.item_id,
      recipe_id: item.recipe_id,
      meal_date: item.meal_date,
      meal_time: item.meal_time,
      meal_day: item.meal_day,
      portion: item.portion,
      recipe: item.recipes
        ? {
            recipe_id: item.recipes.recipe_id || item.recipe_id || null,
            recipe_name: item.recipes.recipe_name || null
          }
        : null
    }))
  };
};

const getAllMealPlans = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('meal_plans')
    .select('*, meal_plan_items(*, recipes(recipe_id, recipe_name))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw { statusCode: 400, message: error.message };
  return data.map(mapMealPlan);
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
  return getMealPlanById(userId, data.plan_id);
};

const getMealPlanById = async (userId, planId) => {
  const { data, error } = await supabaseAdmin
    .from('meal_plans')
    .select('*, meal_plan_items(*, recipes(recipe_id, recipe_name, image_url, cooking_time, difficulty, calories_kcal, protein_g, carbohydrate_g, fat_g, sugar_g, bahan_resep(quantity, unit, food_products(product_name)), recipe_steps(step_number, instruction)))')
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
  
  return mapMealPlan(data);
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
    .select('*, recipes(recipe_id, recipe_name, image_url, cooking_time, difficulty, calories_kcal, protein_g, carbohydrate_g, fat_g, sugar_g, bahan_resep(quantity, unit, food_products(product_name)), recipe_steps(step_number, instruction))')
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
  return getMealPlanById(userId, data.plan_id);
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

const addDays = (dateStr, days) => {
  const date = new Date(`${dateStr}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

const applyPackage = async (userId, body) => {
  const {
    package_id,
    plan_id,
    plan_name,
    start_date,
    meal_time = 'Lunch',
    portion = 1,
    spread_days = false
  } = body;

  if (!package_id) throw { statusCode: 400, message: 'package_id wajib diisi.' };
  if (!start_date) throw { statusCode: 400, message: 'start_date wajib diisi.' };
  if (isNaN(new Date(start_date).getTime())) {
    throw { statusCode: 400, message: 'Format start_date tidak valid. Gunakan YYYY-MM-DD.' };
  }

  // Step 5 — Generate Meal Items (Fetch from junction first as source of truth)
  const { data: packageItems, error: pkgItemsError } = await supabaseAdmin
    .from('meal_package_items')
    .select('recipe_id, meal_time')
    .eq('package_id', package_id);
  if (pkgItemsError) throw { statusCode: 400, message: pkgItemsError.message };
  if (!packageItems || packageItems.length === 0) throw { statusCode: 404, message: 'Paket belum memiliki resep.' };

  // Step 1 — Determine Plan Duration
  const expiresDate = spread_days ? addDays(start_date, packageItems.length - 1) : start_date;

  // Step 2 — Find Overlapping Active Plans (User-isolated)
  const { data: activePlans, error: activePlansError } = await supabaseAdmin
    .from('meal_plans')
    .select('plan_id, plan_name, activated_at, expires_at')
    .eq('user_id', userId)
    .eq('status', 'Active');
  if (activePlansError) throw { statusCode: 400, message: activePlansError.message };

  // JS Overlap Detection
  const targetStart = new Date(start_date);
  const overlappingPlans = (activePlans || []).filter(plan => {
    const activatedAt = new Date(plan.activated_at);
    const expiresAt = plan.expires_at ? new Date(plan.expires_at) : activatedAt; // legacy fallback
    return activatedAt <= targetStart && expiresAt >= targetStart;
  });

  // Step 3 — Replace Same-Date Plan Only
  if (overlappingPlans.length > 0) {
    const overlappingIds = overlappingPlans.map(p => p.plan_id);
    const { error: deactivateError } = await supabaseAdmin
      .from('meal_plans')
      .update({ status: 'Inactive' })
      .in('plan_id', overlappingIds);
    if (deactivateError) throw { statusCode: 400, message: deactivateError.message };
  }

  // Step 4 — Create/Update Plan
  let targetPlanId = plan_id;
  if (targetPlanId) {
    const { data: plan, error: planError } = await supabaseAdmin
      .from('meal_plans')
      .select('plan_id')
      .eq('plan_id', targetPlanId)
      .eq('user_id', userId)
      .single();
    if (planError || !plan) throw { statusCode: 404, message: 'Meal plan tidak ditemukan.' };

    const { error: updateError } = await supabaseAdmin
      .from('meal_plans')
      .update({
        status: 'Active',
        expires_at: expiresDate
      })
      .eq('plan_id', targetPlanId);
    if (updateError) throw { statusCode: 400, message: updateError.message };
  } else {
    const { data: newPlan, error: createError } = await supabaseAdmin
      .from('meal_plans')
      .insert({
        user_id: userId,
        plan_name: plan_name || 'Meal Plan dari Paket',
        status: 'Active',
        activated_at: start_date,
        expires_at: expiresDate
      })
      .select()
      .single();
    if (createError) throw { statusCode: 400, message: createError.message };
    targetPlanId = newPlan.plan_id;
  }

  const items = packageItems.map((item, index) => {
    const mealDate = spread_days ? addDays(start_date, index) : start_date;
    return {
      plan_id: targetPlanId,
      recipe_id: item.recipe_id,
      meal_date: mealDate,
      meal_day: getDayName(mealDate),
      meal_time: item.meal_time,
      portion
    };
  });

  const { data, error } = await supabaseAdmin
    .from('meal_plan_items')
    .insert(items)
    .select('*, recipes(recipe_id, recipe_name)');
  if (error) throw { statusCode: 400, message: error.message };

  return {
    plan_id: targetPlanId,
    package_id,
    inserted_count: data.length,
    items: data
  };
};

module.exports = {
  getAllMealPlans, createMealPlan, getMealPlanById, getMealPlanByDate,
  updateMealPlan, deleteMealPlan, addItem, deleteItem, deleteItemsByDate, applyPackage
};
