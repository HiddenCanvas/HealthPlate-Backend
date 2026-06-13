const { supabaseAdmin } = require('../config/supabase');

const MEAL_TIMES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const toNumber = (value, fallback = 0) => {
  if (value === undefined || value === null || value === '') return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const round = (value) => +Number(value || 0).toFixed(2);

const validateMealTime = (mealTime) => {
  if (!MEAL_TIMES.includes(mealTime)) {
    throw { statusCode: 400, message: 'meal_time harus salah satu dari Breakfast, Lunch, Dinner, atau Snack.' };
  }
};

const getOrCreateDailyLog = async (userId, date) => {
  let { data } = await supabaseAdmin
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('log_date', date)
    .single();

  if (!data) {
    const { data: newLog, error: createError } = await supabaseAdmin
      .from('daily_logs')
      .insert({ user_id: userId, log_date: date })
      .select()
      .single();
    if (createError) throw { statusCode: 400, message: createError.message };
    data = newLog;
  }

  return data;
};

const recalcDailyLog = async (logId) => {
  const { data: entries } = await supabaseAdmin
    .from('log_entries')
    .select('consumed_calories, consumed_sugar, consumed_carbs, consumed_protein, consumed_fat')
    .eq('log_id', logId);

  const totals = entries.reduce((acc, e) => ({
    total_calories: acc.total_calories + (e.consumed_calories || 0),
    total_sugar:    acc.total_sugar    + (e.consumed_sugar    || 0),
    total_carbs:    acc.total_carbs    + (e.consumed_carbs    || 0),
    total_protein:  acc.total_protein  + (e.consumed_protein  || 0),
    total_fat:      acc.total_fat      + (e.consumed_fat      || 0),
  }), { total_calories: 0, total_sugar: 0, total_carbs: 0, total_protein: 0, total_fat: 0 });

  await supabaseAdmin.from('daily_logs').update(totals).eq('log_id', logId);
};

const getAllLogs = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .order('log_date', { ascending: false });
  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

const getLogByDate = async (userId, date) => {
  const { data, error } = await supabaseAdmin
    .from('daily_logs')
    .select('*, log_entries(*, food_products(product_name, brand_name, serving_size_g))')
    .eq('user_id', userId)
    .eq('log_date', date)
    .single();
  if (error) throw { statusCode: 404, message: 'Log tidak ditemukan.' };
  return data;
};

const addEntry = async (userId, date, body) => {
  const { product_id, meal_time, portion } = body;
  if (!meal_time || !portion)
    throw { statusCode: 400, message: 'meal_time dan portion wajib diisi.' };
  validateMealTime(meal_time);

  if (!product_id) return addCustomEntry(userId, date, body);

  const { data: product, error: productError } = await supabaseAdmin
    .from('food_products')
    .select('*')
    .eq('product_id', product_id)
    .single();
  if (productError || !product) throw { statusCode: 404, message: 'Produk tidak ditemukan.' };

  const ratio = portion / product.serving_size_g;
  const entry = {
    meal_time,
    portion,
    consumed_calories: +(product.calories_kcal * ratio).toFixed(2),
    consumed_sugar:    +(product.sugar_g        * ratio).toFixed(2),
    consumed_carbs:    +(product.carbohydrate_g * ratio).toFixed(2),
    consumed_protein:  +(product.protein_g      * ratio).toFixed(2),
    consumed_fat:      +(product.fat_g          * ratio).toFixed(2),
  };

  const log = await getOrCreateDailyLog(userId, date);

  const { data, error } = await supabaseAdmin
    .from('log_entries')
    .insert({ ...entry, log_id: log.log_id, product_id })
    .select()
    .single();
  if (error) throw { statusCode: 400, message: error.message };

  await recalcDailyLog(log.log_id);

  return data;
};

const addCustomEntry = async (userId, date, body) => {
  const {
    meal_time,
    portion,
    custom_name,
    name,
    consumed_calories,
    consumed_sugar,
    consumed_carbs,
    consumed_protein,
    consumed_fat
  } = body;

  const resolvedName = String(custom_name || name || '').trim();
  if (!resolvedName) throw { statusCode: 400, message: 'custom_name wajib diisi untuk log makanan custom.' };
  if (!meal_time || !portion) throw { statusCode: 400, message: 'meal_time dan portion wajib diisi.' };
  validateMealTime(meal_time);

  const log = await getOrCreateDailyLog(userId, date);
  const entry = {
    log_id: log.log_id,
    product_id: null,
    custom_name: resolvedName,
    meal_time,
    portion: toNumber(portion),
    consumed_calories: round(toNumber(consumed_calories)),
    consumed_sugar: round(toNumber(consumed_sugar)),
    consumed_carbs: round(toNumber(consumed_carbs)),
    consumed_protein: round(toNumber(consumed_protein)),
    consumed_fat: round(toNumber(consumed_fat))
  };

  const { data, error } = await supabaseAdmin
    .from('log_entries')
    .insert(entry)
    .select()
    .single();
  if (error) throw { statusCode: 400, message: error.message };

  await recalcDailyLog(log.log_id);
  return data;
};

const deleteEntry = async (userId, date, entryId) => {
  const log = await getOrCreateDailyLog(userId, date);

  const { error } = await supabaseAdmin
    .from('log_entries')
    .delete()
    .eq('entry_id', entryId)
    .eq('log_id', log.log_id);
  if (error) throw { statusCode: 400, message: error.message };

  await recalcDailyLog(log.log_id);
};

const updateWater = async (userId, date, total_water_ml) => {
  if (!total_water_ml) throw { statusCode: 400, message: 'total_water_ml wajib diisi.' };

  const log = await getOrCreateDailyLog(userId, date);

  const { data, error } = await supabaseAdmin
    .from('daily_logs')
    .update({ total_water_ml })
    .eq('log_id', log.log_id)
    .select()
    .single();
  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

const consumeRecipe = async (userId, date, body) => {
  const { recipe_id, meal_time, portion_multiplier, source } = body;

  if (!recipe_id) {
    throw { statusCode: 400, message: 'recipe_id wajib diisi.' };
  }
  if (!meal_time) {
    throw { statusCode: 400, message: 'meal_time wajib diisi.' };
  }
  validateMealTime(meal_time);

  const multiplier = toNumber(portion_multiplier, 1.0);
  if (multiplier <= 0) {
    throw { statusCode: 400, message: 'portion_multiplier harus lebih besar dari 0.' };
  }

  const VALID_SOURCES = ['manual', 'barcode', 'recipe', 'meal_plan'];
  const resolvedSource = source || 'recipe';
  if (!VALID_SOURCES.includes(resolvedSource)) {
    throw { statusCode: 400, message: 'source tidak valid.' };
  }

  // Fetch recipe with its ingredients
  const { data: recipe, error: recipeError } = await supabaseAdmin
    .from('recipes')
    .select('*, bahan_resep(*, food_products(*))')
    .eq('recipe_id', recipe_id)
    .single();

  if (recipeError || !recipe) {
    throw { statusCode: 404, message: 'Resep tidak ditemukan.' };
  }

  const log = await getOrCreateDailyLog(userId, date);

  const hasIngredients = recipe.bahan_resep && recipe.bahan_resep.length > 0;
  let entryPayloads = [];

  if (hasIngredients) {
    entryPayloads = recipe.bahan_resep.map(item => {
      const p = item.food_products;
      if (!p || !p.serving_size_g || p.serving_size_g <= 0) {
        throw { statusCode: 400, message: `Bahan resep dengan produk ID ${item.product_id} memiliki data produk yang tidak lengkap.` };
      }
      const portionVal = round(item.quantity * multiplier);
      const ratio = portionVal / p.serving_size_g;
      return {
        log_id: log.log_id,
        product_id: item.product_id,
        meal_time,
        portion: portionVal,
        consumed_calories: round(p.calories_kcal * ratio),
        consumed_sugar: round(p.sugar_g * ratio),
        consumed_carbs: round(p.carbohydrate_g * ratio),
        consumed_protein: round(p.protein_g * ratio),
        consumed_fat: round(p.fat_g * ratio),
        recipe_id,
        source: resolvedSource
      };
    });
  } else {
    const portionVal = multiplier;
    entryPayloads = [{
      log_id: log.log_id,
      product_id: null,
      custom_name: recipe.recipe_name,
      meal_time,
      portion: portionVal,
      consumed_calories: round(toNumber(recipe.calories_kcal) * multiplier),
      consumed_sugar: round(toNumber(recipe.sugar_g) * multiplier),
      consumed_carbs: round(toNumber(recipe.carbohydrate_g) * multiplier),
      consumed_protein: round(toNumber(recipe.protein_g) * multiplier),
      consumed_fat: round(toNumber(recipe.fat_g) * multiplier),
      recipe_id,
      source: resolvedSource
    }];
  }

  const { data: insertedEntries, error: insertError } = await supabaseAdmin
    .from('log_entries')
    .insert(entryPayloads)
    .select();

  if (insertError) {
    throw { statusCode: 400, message: insertError.message };
  }

  await recalcDailyLog(log.log_id);

  const representativeEntry = insertedEntries[0];
  return {
    entry_id: representativeEntry.entry_id,
    recipe_id: recipe_id,
    meal_time: meal_time
  };
};

module.exports = { getAllLogs, getLogByDate, addEntry, addCustomEntry, deleteEntry, updateWater, consumeRecipe };
