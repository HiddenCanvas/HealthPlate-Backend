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
    .select('recipe_id')
    .eq('recipe_id', recipeId)
    .eq('user_id', userId)
    .single();
  if (recipeError || !recipe) throw { statusCode: 404, message: 'Resep tidak ditemukan.' };

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

module.exports = { uploadImage, updateAvatar, updateRecipeImage };
