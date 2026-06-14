const { supabaseAdmin } = require('../config/supabase');

const uploadImage = async (file, folder = 'general') => {
  const ext = file.originalname.split('.').pop();
  const filename = folder + '/' + Date.now() + '-' + Math.random().toString(36).substring(2) + '.' + ext;

  const { data, error } = await supabaseAdmin.storage
    .from('healthplate-images')
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) throw { statusCode: 400, message: error.message };

  const { data: urlData } = supabaseAdmin.storage
    .from('healthplate-images')
    .getPublicUrl(filename);

  return urlData.publicUrl;
};

const updateAvatar = async (userId, file) => {
  const url = await uploadImage(file, 'avatars');

  const { data, error } = await supabaseAdmin
    .from('users')
    .update({ avatar_url: url })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

const updateRecipeImage = async (userId, recipeId, file) => {
  // Pastikan resep milik user
  const { data: recipe, error: recipeError } = await supabaseAdmin
    .from('recipes')
    .select('recipe_id, user_id')
    .eq('recipe_id', recipeId)
    .single();
  if (recipeError || !recipe || recipe.user_id !== userId) {
    throw { statusCode: 403, message: 'Resep tidak ditemukan atau bukan milik Anda.' };
  }

  const url = await uploadImage(file, 'recipes');

  const { data, error } = await supabaseAdmin
    .from('recipes')
    .update({ image_url: url })
    .eq('recipe_id', recipeId)
    .select()
    .single();

  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

const updateConsumptionPhoto = async (userId, entryId, file) => {
  if (!entryId) throw { statusCode: 400, message: 'entry_id wajib diisi.' };

  const { data: entry, error: entryError } = await supabaseAdmin
    .from('log_entries')
    .select('entry_id, daily_logs!inner(user_id)')
    .eq('entry_id', entryId)
    .eq('daily_logs.user_id', userId)
    .single();
  if (entryError || !entry) throw { statusCode: 404, message: 'Entry log tidak ditemukan.' };

  const url = await uploadImage(file, 'consumption');

  const { data, error } = await supabaseAdmin
    .from('log_entries')
    .update({ image_url: url })
    .eq('entry_id', entryId)
    .select()
    .single();

  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

const uploadAiFoodImage = async (file, userId, date) => {
  if (!file) throw { statusCode: 400, message: 'File gambar wajib diupload.' };

  const ext = file.originalname ? file.originalname.split('.').pop() : 'jpg';
  const crypto = require('crypto');
  const uuid = crypto.randomUUID ? crypto.randomUUID() : (Date.now() + '-' + Math.random().toString(36).substring(2));
  const filename = `food-logs/${userId}/${date}/${uuid}.${ext}`;

  const { data, error } = await supabaseAdmin.storage
    .from('healthplate-images')
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) throw { statusCode: 400, message: error.message };

  const { data: urlData } = supabaseAdmin.storage
    .from('healthplate-images')
    .getPublicUrl(filename);

  return {
    publicUrl: urlData.publicUrl,
    storagePath: filename
  };
};

module.exports = { uploadImage, updateAvatar, updateRecipeImage, updateConsumptionPhoto, uploadAiFoodImage };
