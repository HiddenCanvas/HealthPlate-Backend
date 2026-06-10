const { supabaseAdmin } = require('../config/supabase');

const getAllTips = async ({ page = 1, limit = 10, category } = {}) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from('tips')
    .select('*, users(name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (category) query = query.eq('category', category);

  const { data, error, count } = await query;
  if (error) throw { statusCode: 400, message: error.message };
  return { data, total: count, page, limit };
};

const getTipById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('tips')
    .select('*, users(name)')
    .eq('tip_id', id)
    .single();
  if (error) throw { statusCode: 404, message: 'Tips tidak ditemukan.' };
  return data;
};

const createTip = async (userId, body) => {
  const { title, content, category, image_url } = body;
  if (!title || !content)
    throw { statusCode: 400, message: 'title dan content wajib diisi.' };

  const { data, error } = await supabaseAdmin
    .from('tips')
    .insert({ user_id: userId, title, content, category, image_url })
    .select()
    .single();
  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

const updateTip = async (userId, tipId, body) => {
  const allowed = ['title', 'content', 'category', 'image_url'];
  const updates = {};
  allowed.forEach(k => { if (body[k] !== undefined) updates[k] = body[k]; });
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('tips')
    .update(updates)
    .eq('tip_id', tipId)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

const deleteTip = async (userId, tipId) => {
  const { error } = await supabaseAdmin
    .from('tips')
    .delete()
    .eq('tip_id', tipId)
    .eq('user_id', userId);
  if (error) throw { statusCode: 400, message: error.message };
};

module.exports = { getAllTips, getTipById, createTip, updateTip, deleteTip };