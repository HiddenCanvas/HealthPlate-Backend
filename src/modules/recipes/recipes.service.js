const supabase = require('../../config/supabase');

const listRecipes = async ({ search, page = 1, limit = 20 }) => {
  let query = supabase.from('recipes').select('*').order('created_at', { ascending: false });
  if (search) query = query.ilike('recipe_name', `%${search}%`);
  const from = (page - 1) * limit;
  const { data, error } = await query.range(from, from + limit - 1);
  if (error) throw new Error(error.message);
  return data;
};

const createRecipe = async (userId, payload) => {
  const { recipe_name, description, instructions, ingredients } = payload;
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .insert({ user_id: userId, recipe_name, description, instructions })
    .select('*')
    .single();
  if (recipeError) throw new Error(recipeError.message);

  const items = ingredients.map((item) => ({
    recipe_id: recipe.recipe_id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit: item.unit
  }));
  const { error: ingredientsError } = await supabase.from('bahan_resep').insert(items);
  if (ingredientsError) {
    await supabase.from('recipes').delete().eq('recipe_id', recipe.recipe_id);
    throw new Error(ingredientsError.message);
  }

  return recipe;
};

const getRecipe = async (recipeId) => {
  const { data, error } = await supabase
    .from('recipes')
    .select('*, bahan_resep(*)')
    .eq('recipe_id', recipeId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Recipe not found');
  return data;
};

const updateRecipe = async (userId, recipeId, payload) => {
  const { data: existingRecipe, error: recipeError } = await supabase
    .from('recipes')
    .select('*')
    .eq('recipe_id', recipeId)
    .eq('user_id', userId)
    .maybeSingle();
  if (recipeError) throw new Error(recipeError.message);
  if (!existingRecipe) throw new Error('Recipe not found');

  const updatePayload = {};
  if (payload.recipe_name) updatePayload.recipe_name = payload.recipe_name;
  if (payload.description !== undefined) updatePayload.description = payload.description;
  if (payload.instructions) updatePayload.instructions = payload.instructions;

  const { data: updatedRecipe, error: updateError } = await supabase
    .from('recipes')
    .update(updatePayload)
    .eq('recipe_id', recipeId)
    .select('*')
    .single();
  if (updateError) throw new Error(updateError.message);

  if (payload.ingredients) {
    const { error: deleteError } = await supabase.from('bahan_resep').delete().eq('recipe_id', recipeId);
    if (deleteError) throw new Error(deleteError.message);

    const items = payload.ingredients.map((item) => ({
      recipe_id: recipeId,
      product_id: item.product_id,
      quantity: item.quantity,
      unit: item.unit
    }));
    const { error: insertError } = await supabase.from('bahan_resep').insert(items);
    if (insertError) throw new Error(insertError.message);
  }

  return updatedRecipe;
};

const deleteRecipe = async (userId, recipeId) => {
  const { error } = await supabase.from('recipes').delete().eq('recipe_id', recipeId).eq('user_id', userId);
  if (error) throw new Error(error.message);
  return true;
};

module.exports = { listRecipes, createRecipe, getRecipe, updateRecipe, deleteRecipe };
