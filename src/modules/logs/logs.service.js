const supabase = require('../../config/supabase');
const { checkAndNotify } = require('../../utils/calorieAlert');

const getDailyLog = async (userId, date) => {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*, log_entries(*)')
    .eq('user_id', userId)
    .eq('log_date', date)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data || { log_date: date, total_calories: 0, total_sugar: 0, total_carbs: 0, total_protein: 0, total_fat: 0, total_water_ml: 0, log_entries: [] };
};

const recalculateDailyTotals = async (logId) => {
  const { data: entries, error: entriesError } = await supabase
    .from('log_entries')
    .select('*')
    .eq('log_id', logId);
  if (entriesError) throw new Error(entriesError.message);

  const totals = entries.reduce(
    (acc, item) => {
      acc.total_calories += Number(item.consumed_calories || 0);
      acc.total_sugar += Number(item.consumed_sugar || 0);
      acc.total_carbs += Number(item.consumed_carbs || 0);
      acc.total_protein += Number(item.consumed_protein || 0);
      acc.total_fat += Number(item.consumed_fat || 0);
      return acc;
    },
    { total_calories: 0, total_sugar: 0, total_carbs: 0, total_protein: 0, total_fat: 0 }
  );

  const { error: updateError } = await supabase
    .from('daily_logs')
    .update(totals)
    .eq('log_id', logId);
  if (updateError) throw new Error(updateError.message);

  return totals;
};

const addEntry = async (userId, payload) => {
  const date = payload.date || new Date().toISOString().slice(0, 10);
  const { data: product, error: productError } = await supabase
    .from('food_products')
    .select('*')
    .eq('product_id', payload.product_id)
    .maybeSingle();
  if (productError) throw new Error(productError.message);
  if (!product) throw new Error('Product not found');

  const factor = Number(payload.portion) / Number(product.serving_size_g || 100);
  const entryPayload = {
    meal_time: payload.meal_time,
    portion: payload.portion,
    consumed_calories: Number(product.calories_kcal || 0) * factor,
    consumed_sugar: Number(product.sugar_g || 0) * factor,
    consumed_carbs: Number(product.carbohydrate_g || 0) * factor,
    consumed_protein: Number(product.protein_g || 0) * factor,
    consumed_fat: Number(product.fat_g || 0) * factor,
    product_id: payload.product_id
  };

  const { data: existingDaily, error: dailyError } = await supabase
    .from('daily_logs')
    .select('log_id, total_sugar, total_calories, total_carbs, total_protein, total_fat, total_water_ml')
    .eq('user_id', userId)
    .eq('log_date', date)
    .maybeSingle();
  if (dailyError) throw new Error(dailyError.message);

  const dailyData = {
    user_id: userId,
    log_date: date,
    total_calories: Number(entryPayload.consumed_calories),
    total_sugar: Number(entryPayload.consumed_sugar),
    total_carbs: Number(entryPayload.consumed_carbs),
    total_protein: Number(entryPayload.consumed_protein),
    total_fat: Number(entryPayload.consumed_fat),
    total_water_ml: Number(existingDaily?.total_water_ml || 0)
  };

  let logId = existingDaily?.log_id;
  if (!logId) {
    const { data: insertedDaily, error: insertDailyError } = await supabase
      .from('daily_logs')
      .insert(dailyData)
      .select('log_id')
      .single();
    if (insertDailyError) throw new Error(insertDailyError.message);
    logId = insertedDaily.log_id;
  } else {
    const { error: updateDailyError } = await supabase
      .from('daily_logs')
      .update({
        total_calories: Number(existingDaily.total_calories) + dailyData.total_calories,
        total_sugar: Number(existingDaily.total_sugar) + dailyData.total_sugar,
        total_carbs: Number(existingDaily.total_carbs) + dailyData.total_carbs,
        total_protein: Number(existingDaily.total_protein) + dailyData.total_protein,
        total_fat: Number(existingDaily.total_fat) + dailyData.total_fat
      })
      .eq('log_id', logId);
    if (updateDailyError) throw new Error(updateDailyError.message);
  }

  const { data: entry, error: entryError } = await supabase
    .from('log_entries')
    .insert({ ...entryPayload, log_id: logId })
    .select('*')
    .single();
  if (entryError) throw new Error(entryError.message);

  const totals = await recalculateDailyTotals(logId);

  const { data: user, error: userError } = await supabase.from('users').select('calories_kcal').eq('user_id', userId).maybeSingle();
  if (userError) throw new Error(userError.message);

  await checkAndNotify(supabase, userId, totals.total_calories, user?.calories_kcal);

  return { entry, daily_summary: totals, date };
};

const deleteEntry = async (userId, entryId) => {
  const { data: entry, error: entryError } = await supabase
    .from('log_entries')
    .select('*, daily_logs(user_id)')
    .eq('entry_id', entryId)
    .maybeSingle();
  if (entryError) throw new Error(entryError.message);
  if (!entry) throw new Error('Entry not found');
  if (entry.daily_logs?.user_id !== userId) throw new Error('Unauthorized');

  const { error: deleteError } = await supabase.from('log_entries').delete().eq('entry_id', entryId);
  if (deleteError) throw new Error(deleteError.message);

  await recalculateDailyTotals(entry.log_id);
  return true;
};

const getHistory = async (userId, params) => {
  const { from, to, page, limit } = params;
  let query = supabase.from('daily_logs').select('*').eq('user_id', userId).order('log_date', { ascending: false });
  if (from) query = query.gte('log_date', from);
  if (to) query = query.lte('log_date', to);

  const rangeStart = (page - 1) * limit;
  const { data, error } = await query.range(rangeStart, rangeStart + limit - 1);
  if (error) throw new Error(error.message);
  return data;
};

module.exports = { getDailyLog, addEntry, deleteEntry, getHistory };
