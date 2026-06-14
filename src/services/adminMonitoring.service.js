const { supabaseAdmin } = require('../config/supabase');

const clampPagination = ({ page = 1, limit = 20 } = {}) => {
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  return {
    page: safePage,
    limit: safeLimit,
    from: (safePage - 1) * safeLimit,
    to: safePage * safeLimit - 1
  };
};

const getUsers = async (query = {}) => {
  const { page, limit, from, to } = clampPagination(query);

  let builder = supabaseAdmin
    .from('users')
    .select('user_id, name, email, role, gender, birth_date, weight_kg, height_cm, calories_kcal, sugar_g, carbohydrate_g, protein_g, fat_g, avatar_url, created_at', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false });

  if (query.role) builder = builder.eq('role', query.role);
  if (query.q) {
    const search = String(query.q).replace(/[%(),]/g, '');
    builder = builder.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error, count } = await builder;
  if (error) throw { statusCode: 400, message: error.message };
  return { data: data || [], total: count || 0, page, limit };
};

const serializeLogEntry = (entry) => {
  if (!entry) return entry;
  return {
    ...entry,
    source: entry.source === 'ai_prediction' ? 'manual' : entry.source
  };
};

const getLogs = async (query = {}) => {
  const { page, limit, from, to } = clampPagination(query);

  let builder = supabaseAdmin
    .from('daily_logs')
    .select('*, users(user_id, name, email), log_entries(*, food_products(product_name, brand_name))', { count: 'exact' })
    .range(from, to)
    .order('log_date', { ascending: false });

  if (query.user_id) builder = builder.eq('user_id', query.user_id);
  if (query.date) builder = builder.eq('log_date', query.date);
  if (query.from_date) builder = builder.gte('log_date', query.from_date);
  if (query.to_date) builder = builder.lte('log_date', query.to_date);

  const { data, error, count } = await builder;
  if (error) throw { statusCode: 400, message: error.message };

  const serializedData = (data || []).map(log => {
    if (log && log.log_entries) {
      return {
        ...log,
        log_entries: log.log_entries.map(serializeLogEntry)
      };
    }
    return log;
  });

  return { data: serializedData, total: count || 0, page, limit };
};

module.exports = { getUsers, getLogs };
