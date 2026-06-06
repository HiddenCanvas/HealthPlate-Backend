const supabase = require('../../config/supabase');

const listBookmarks = async (userId, type) => {
  let query = supabase.from('user_bookmarks').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (type === 'product') query = query.not('product_id', 'is', null);
  if (type === 'recipe') query = query.not('recipe_id', 'is', null);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

const createBookmark = async (userId, payload) => {
  const { data, error } = await supabase.from('user_bookmarks').insert({ user_id: userId, ...payload }).select('*').single();
  if (error) throw new Error(error.message);
  return data;
};

const deleteBookmark = async (userId, bookmarkId) => {
  const { error } = await supabase.from('user_bookmarks').delete().eq('bookmark_id', bookmarkId).eq('user_id', userId);
  if (error) throw new Error(error.message);
  return true;
};

module.exports = { listBookmarks, createBookmark, deleteBookmark };
