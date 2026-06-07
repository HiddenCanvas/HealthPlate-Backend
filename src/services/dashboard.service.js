const { supabaseAdmin } = require('../config/supabase');

const getSummary = async (userId) => {
  const today = new Date().toISOString().split('T')[0];

  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('calories_kcal, sugar_g, carbohydrate_g, protein_g, fat_g')
    .eq('user_id', userId)
    .single();
  if (userError) throw { statusCode: 404, message: 'User tidak ditemukan.' };

  const { data: log } = await supabaseAdmin
    .from('daily_logs')
    .select('*, log_entries(*, food_products(product_name))')
    .eq('user_id', userId)
    .eq('log_date', today)
    .single();

  const consumed = {
    calories: log?.total_calories || 0,
    sugar: log?.total_sugar || 0,
    carbohydrate: log?.total_carbs || 0,
    protein: log?.total_protein || 0,
    fat: log?.total_fat || 0,
    water_ml: log?.total_water_ml || 0,
  };

  const target = {
    calories: user.calories_kcal || 2000,
    sugar: user.sugar_g || 50,
    carbohydrate: user.carbohydrate_g || 300,
    protein: user.protein_g || 60,
    fat: user.fat_g || 65,
    water_ml: 2000,
  };

  const percentage = {
    calories: +((consumed.calories / target.calories) * 100).toFixed(1),
    sugar: +((consumed.sugar / target.sugar) * 100).toFixed(1),
    carbohydrate: +((consumed.carbohydrate / target.carbohydrate) * 100).toFixed(1),
    protein: +((consumed.protein / target.protein) * 100).toFixed(1),
    fat: +((consumed.fat / target.fat) * 100).toFixed(1),
    water_ml: +((consumed.water_ml / target.water_ml) * 100).toFixed(1),
  };

  return {
    date: today,
    consumed,
    target,
    percentage,
    entries: log?.log_entries || [],
  };
};

const getHistory = async (userId, days = 7) => {
  const from = new Date();
  from.setDate(from.getDate() - days);
  const fromDate = from.toISOString().split('T')[0];

  const { data, error } = await supabaseAdmin
    .from('daily_logs')
    .select('log_date, total_calories, total_sugar, total_carbs, total_protein, total_fat, total_water_ml')
    .eq('user_id', userId)
    .gte('log_date', fromDate)
    .order('log_date', { ascending: true });

  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

module.exports = { getSummary, getHistory };