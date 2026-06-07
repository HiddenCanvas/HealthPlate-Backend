const { supabaseAdmin, supabaseAnon } = require('../config/supabase');

const register = async ({ name, email, password }) => {
  const { data, error } = await supabaseAnon.auth.signUp({
    email,
    password,
    options: { data: { name } }
  });
  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

const login = async ({ email, password }) => {
  const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });
  if (error) throw { statusCode: 401, message: error.message };
  return data;
};

const logout = async (token) => {
  const { error } = await supabaseAdmin.auth.admin.signOut(token);
  if (error) throw { statusCode: 400, message: error.message };
};

const getMe = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) throw { statusCode: 404, message: 'User tidak ditemukan.' };
  return data;
};

const updateMe = async (userId, body) => {
  const allowed = ['name', 'gender', 'birth_date', 'weight_kg', 'height_cm', 'calories_kcal', 'sugar_g', 'carbohydrate_g', 'protein_g', 'fat_g'];
  const updates = {};
  allowed.forEach(k => { if (body[k] !== undefined) updates[k] = body[k]; });

  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

module.exports = { register, login, logout, getMe, updateMe };