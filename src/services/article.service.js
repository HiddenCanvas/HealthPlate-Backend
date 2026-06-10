const { supabaseAdmin } = require('../config/supabase');

const getAllArticles = async ({ page = 1, limit = 10, category } = {}) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from('articles')
    .select('article_id, title, summary, category, image_url, views, likes, created_at, users!articles_user_id_fkey(name, avatar_url)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (category) query = query.eq('category', category);

  const { data, error, count } = await query;
  if (error) throw { statusCode: 400, message: error.message };
  return { data, total: count, page, limit };
};

const getArticleById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('articles')
    .select('*, users!articles_user_id_fkey(name, avatar_url)')
    .eq('article_id', id)
    .single();
  if (error) throw { statusCode: 404, message: 'Artikel tidak ditemukan.' };
  return data;
};

const incrementView = async (id) => {
  const { error } = await supabaseAdmin.rpc('increment_article_views', { article_id: id });
  if (error) console.warn('[incrementView] RPC error:', error.message);
};

const createArticle = async (userId, body) => {
  const { title, content, summary, category, image_url, tags } = body;
  if (!title || !content)
    throw { statusCode: 400, message: 'title dan content wajib diisi.' };

  const { data, error } = await supabaseAdmin
    .from('articles')
    .insert({ user_id: userId, title, content, summary, category, image_url, tags, views: 0, likes: 0 })
    .select()
    .single();
  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

const updateArticle = async (userId, articleId, body) => {
  const { data: existing, error: checkError } = await supabaseAdmin
    .from('articles')
    .select('article_id')
    .eq('article_id', articleId)
    .eq('user_id', userId)
    .single();

  if (checkError || !existing)
    throw { statusCode: 403, message: 'Artikel tidak ditemukan atau bukan milik Anda.' };

  const allowed = ['title', 'content', 'summary', 'category', 'image_url', 'tags', 'status'];
  const updates = {};
  allowed.forEach(k => { if (body[k] !== undefined) updates[k] = body[k]; });
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('articles')
    .update(updates)
    .eq('article_id', articleId)
    .select()
    .single();
  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

const deleteArticle = async (userId, articleId) => {
  const { data: existing, error: checkError } = await supabaseAdmin
    .from('articles')
    .select('article_id')
    .eq('article_id', articleId)
    .eq('user_id', userId)
    .single();

  if (checkError || !existing)
    throw { statusCode: 403, message: 'Artikel tidak ditemukan atau bukan milik Anda.' };

  const { error } = await supabaseAdmin
    .from('articles')
    .delete()
    .eq('article_id', articleId);
  if (error) throw { statusCode: 400, message: error.message };
};

const likeArticle = async (userId, articleId) => {
  const { data: existing } = await supabaseAdmin
    .from('article_likes')
    .select('like_id')
    .eq('user_id', userId)
    .eq('article_id', articleId)
    .single();

  if (existing) {
    await supabaseAdmin.from('article_likes').delete().eq('like_id', existing.like_id);
    await supabaseAdmin.rpc('decrement_article_likes', { article_id: articleId });
    return { liked: false };
  } else {
    await supabaseAdmin.from('article_likes').insert({ user_id: userId, article_id: articleId });
    await supabaseAdmin.rpc('increment_article_likes', { article_id: articleId });
    return { liked: true };
  }
};

const bookmarkArticle = async (userId, articleId) => {
  const { data: existing } = await supabaseAdmin
    .from('article_bookmarks')
    .select('bookmark_id')
    .eq('user_id', userId)
    .eq('article_id', articleId)
    .single();

  if (existing) {
    await supabaseAdmin.from('article_bookmarks').delete().eq('bookmark_id', existing.bookmark_id);
    return { bookmarked: false };
  } else {
    await supabaseAdmin.from('article_bookmarks').insert({ user_id: userId, article_id: articleId });
    return { bookmarked: true };
  }
};

const getEngagement = async (articleId) => {
  const { data, error } = await supabaseAdmin
    .from('articles')
    .select('article_id, title, views, likes, created_at')
    .eq('article_id', articleId)
    .single();
  if (error) throw { statusCode: 404, message: 'Artikel tidak ditemukan.' };

  const { count: bookmarkCount } = await supabaseAdmin
    .from('article_bookmarks')
    .select('*', { count: 'exact', head: true })
    .eq('article_id', articleId);

  return { ...data, bookmarks: bookmarkCount || 0 };
};

const getAllEngagementSummary = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('articles')
    .select('article_id, title, views, likes, created_at')
    .eq('user_id', userId)
    .order('views', { ascending: false });
  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

module.exports = {
  getAllArticles, getArticleById, incrementView, createArticle,
  updateArticle, deleteArticle, likeArticle, bookmarkArticle,
  getEngagement, getAllEngagementSummary
};
