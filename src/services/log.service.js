const { supabaseAdmin } = require('../config/supabase');

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
  if (!product_id || !meal_time || !portion)
    throw { statusCode: 400, message: 'product_id, meal_time, dan portion wajib diisi.' };

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

module.exports = { getAllLogs, getLogByDate, addEntry, deleteEntry, updateWater };
