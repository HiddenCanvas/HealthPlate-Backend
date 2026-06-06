const supabase = require('../../config/supabase');

const getMe = async (userId) => {
  const { data, error } = await supabase.from('users').select('*').eq('user_id', userId).single();
  if (error) throw new Error(error.message);
  return data;
};

const updateProfile = async (userId, payload) => {
  const { data, error } = await supabase.from('users').update(payload).eq('user_id', userId).select('*').single();
  if (error) throw new Error(error.message);
  return data;
};

module.exports = { getMe, updateProfile };
