const { supabaseAdmin } = require('../config/supabase');

// --- Helper Functions ---

const calculateNutrition = async (recipeId) => {
  // Ambil semua bahan dari resep ini beserta nutrisi produknya
  const { data: ingredients, error } = await supabaseAdmin
    .from('bahan_resep')
    .select('quantity, food_products(serving_size_g, calories_kcal, protein_g, carbohydrate_g, fat_g, sugar_g)')
    .eq('recipe_id', recipeId);

  if (error) throw { statusCode: 400, message: error.message };

  let total_cal = 0, total_pro = 0, total_car = 0, total_fat = 0, total_sug = 0;

  if (ingredients && ingredients.length > 0) {
    ingredients.forEach(item => {
      const p = item.food_products;
      if (p && p.serving_size_g > 0) {
        const ratio = item.quantity / p.serving_size_g;
        total_cal += p.calories_kcal * ratio;
        total_pro += p.protein_g * ratio;
        total_car += p.carbohydrate_g * ratio;
        total_fat += p.fat_g * ratio;
        total_sug += p.sugar_g * ratio;
      }
    });
  }

  // Update nilai nutrisi di tabel recipes
  await supabaseAdmin
    .from('recipes')
    .update({
      calories_kcal: parseFloat(total_cal.toFixed(2)),
      protein_g: parseFloat(total_pro.toFixed(2)),
      carbohydrate_g: parseFloat(total_car.toFixed(2)),
      fat_g: parseFloat(total_fat.toFixed(2)),
      sugar_g: parseFloat(total_sug.toFixed(2))
    })
    .eq('recipe_id', recipeId);
};


// --- Meal Categories & Packages ---

const getCategories = async () => {
  const { data, error } = await supabaseAdmin
    .from('meal_categories')
    .select('*, meal_packages(*)');
  if (error) throw { statusCode: 400, message: error.message };
  return data;
};


// --- Recipes CRUD ---

const getAllRecipes = async () => {
  const { data, error } = await supabaseAdmin
    .from('recipes')
    .select('*, users!recipes_user_id_fkey(name), meal_packages(package_name, meal_categories(category_name)), bahan_resep(*, food_products(product_name, serving_size_g, calories_kcal)), recipe_steps(*)')
    .order('created_at', { ascending: false });
  if (error) throw { statusCode: 400, message: error.message };
  
  // Urutkan langkah-langkah memasak
  data.forEach(recipe => {
    if (recipe.recipe_steps) {
      recipe.recipe_steps.sort((a, b) => a.step_number - b.step_number);
    }
  });

  return data;
};

const getRecipeById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('recipes')
    .select('*, users!recipes_user_id_fkey(name), meal_packages(package_name, meal_categories(category_name)), bahan_resep(*, food_products(product_name, serving_size_g, calories_kcal, protein_g, carbohydrate_g, fat_g, sugar_g)), recipe_steps(*)')
    .eq('recipe_id', id)
    .single();
    
  if (error) throw { statusCode: 404, message: 'Resep tidak ditemukan.' };
  
  if (data.recipe_steps) {
    data.recipe_steps.sort((a, b) => a.step_number - b.step_number);
  }
  
  return data;
};

const searchRecipes = async (q) => {
  const { data, error } = await supabaseAdmin
    .from('recipes')
    .select('*, users!recipes_user_id_fkey(name), meal_packages(package_name, meal_categories(category_name))')
    .ilike('recipe_name', '%' + q + '%')
    .limit(20);
  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

const createRecipe = async (userId, body) => {
  const { recipe_name, description, instructions, image_url, cooking_time, difficulty, servings, package_id, steps } = body;
  
  if (!recipe_name || !instructions)
    throw { statusCode: 400, message: 'recipe_name dan instructions wajib diisi.' };

  // 1. Create Recipe
  const payload = { 
    user_id: userId, 
    recipe_name, 
    description, 
    instructions,
    image_url,
    cooking_time,
    difficulty,
    servings,
    package_id
  };
  
  const { data: recipe, error } = await supabaseAdmin
    .from('recipes')
    .insert(payload)
    .select()
    .single();
    
  if (error) throw { statusCode: 400, message: error.message };

  // 2. Insert Steps if provided
  if (steps && Array.isArray(steps) && steps.length > 0) {
    const stepPayloads = steps.map((instruction, index) => ({
      recipe_id: recipe.recipe_id,
      step_number: index + 1,
      instruction
    }));
    
    await supabaseAdmin.from('recipe_steps').insert(stepPayloads);
  }

  return await getRecipeById(recipe.recipe_id);
};

const updateRecipe = async (userId, recipeId, body) => {
  const { data: recipe, error: checkError } = await supabaseAdmin
    .from('recipes')
    .select('recipe_id, user_id')
    .eq('recipe_id', recipeId)
    .single();

  if (checkError || !recipe || (recipe.user_id !== null && recipe.user_id !== userId))
    throw { statusCode: 403, message: 'Resep tidak ditemukan atau bukan milik Anda.' };

  const allowed = ['recipe_name', 'description', 'instructions', 'image_url', 'cooking_time', 'difficulty', 'servings', 'package_id'];
  const updates = {};
  allowed.forEach(k => { if (body[k] !== undefined) updates[k] = body[k]; });
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('recipes')
    .update(updates)
    .eq('recipe_id', recipeId)
    .select()
    .single();
    
  if (error) throw { statusCode: 400, message: error.message };
  
  // Jika body mengirimkan steps baru, kita bisa replace semua steps lama
  if (body.steps && Array.isArray(body.steps)) {
    await supabaseAdmin.from('recipe_steps').delete().eq('recipe_id', recipeId);
    
    if (body.steps.length > 0) {
      const stepPayloads = body.steps.map((instruction, index) => ({
        recipe_id: recipeId,
        step_number: index + 1,
        instruction
      }));
      await supabaseAdmin.from('recipe_steps').insert(stepPayloads);
    }
  }

  return await getRecipeById(recipeId);
};

const deleteRecipe = async (userId, recipeId) => {
  const { data: recipe, error: checkError } = await supabaseAdmin
    .from('recipes')
    .select('recipe_id, user_id')
    .eq('recipe_id', recipeId)
    .single();

  if (checkError || !recipe || (recipe.user_id !== null && recipe.user_id !== userId))
    throw { statusCode: 403, message: 'Resep tidak ditemukan atau bukan milik Anda.' };

  const { error } = await supabaseAdmin
    .from('recipes')
    .delete()
    .eq('recipe_id', recipeId);
  if (error) throw { statusCode: 400, message: error.message };
};


// --- Recipe Ingredients ---

const addIngredient = async (userId, recipeId, body) => {
  const { product_id, quantity, unit } = body;
  if (!product_id || !quantity || !unit)
    throw { statusCode: 400, message: 'product_id, quantity, dan unit wajib diisi.' };

  const { data: recipe, error: recipeError } = await supabaseAdmin
    .from('recipes')
    .select('recipe_id, user_id')
    .eq('recipe_id', recipeId)
    .single();
    
  if (recipeError || !recipe || (recipe.user_id !== null && recipe.user_id !== userId))
    throw { statusCode: 403, message: 'Resep tidak ditemukan atau bukan milik Anda.' };

  const { data, error } = await supabaseAdmin
    .from('bahan_resep')
    .insert({ recipe_id: recipeId, product_id, quantity, unit })
    .select()
    .single();
    
  if (error) throw { statusCode: 400, message: error.message };
  
  // Hitung ulang nutrisi setelah nambah bahan
  await calculateNutrition(recipeId);
  
  return data;
};

const deleteIngredient = async (userId, recipeId, bahanId) => {
  const { data: recipe, error: recipeError } = await supabaseAdmin
    .from('recipes')
    .select('recipe_id, user_id')
    .eq('recipe_id', recipeId)
    .single();
    
  if (recipeError || !recipe || (recipe.user_id !== null && recipe.user_id !== userId))
    throw { statusCode: 403, message: 'Resep tidak ditemukan atau bukan milik Anda.' };

  const { error } = await supabaseAdmin
    .from('bahan_resep')
    .delete()
    .eq('bahan_id', bahanId)
    .eq('recipe_id', recipeId);
    
  if (error) throw { statusCode: 400, message: error.message };
  
  // Hitung ulang nutrisi setelah hapus bahan
  await calculateNutrition(recipeId);
};


// --- Recipe Steps ---

const addStep = async (userId, recipeId, body) => {
  const { step_number, instruction } = body;
  if (!step_number || !instruction)
    throw { statusCode: 400, message: 'step_number dan instruction wajib diisi.' };

  const { data: recipe, error: recipeError } = await supabaseAdmin
    .from('recipes')
    .select('recipe_id, user_id')
    .eq('recipe_id', recipeId)
    .single();
    
  if (recipeError || !recipe || (recipe.user_id !== null && recipe.user_id !== userId))
    throw { statusCode: 403, message: 'Resep tidak ditemukan atau bukan milik Anda.' };

  const { data, error } = await supabaseAdmin
    .from('recipe_steps')
    .insert({ recipe_id: recipeId, step_number, instruction })
    .select()
    .single();
    
  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

const deleteStep = async (userId, recipeId, stepId) => {
  const { data: recipe, error: recipeError } = await supabaseAdmin
    .from('recipes')
    .select('recipe_id, user_id')
    .eq('recipe_id', recipeId)
    .single();
    
  if (recipeError || !recipe || (recipe.user_id !== null && recipe.user_id !== userId))
    throw { statusCode: 403, message: 'Resep tidak ditemukan atau bukan milik Anda.' };

  const { error } = await supabaseAdmin
    .from('recipe_steps')
    .delete()
    .eq('step_id', stepId)
    .eq('recipe_id', recipeId);
    
  if (error) throw { statusCode: 400, message: error.message };
};


module.exports = {
  getCategories,
  getAllRecipes, 
  getRecipeById, 
  searchRecipes,
  createRecipe, 
  updateRecipe,
  deleteRecipe, 
  addIngredient, 
  deleteIngredient,
  addStep,
  deleteStep,
  calculateNutrition
};
