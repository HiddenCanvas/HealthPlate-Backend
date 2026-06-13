const { supabaseAdmin } = require('./src/config/supabase');

async function verify() {
  try {
    console.log('=== Recipe Completeness Audit ===');
    console.log('');

    // Fetch all recipes referenced by meal_package_items
    const { data: packageItems, error: itemsError } = await supabaseAdmin
      .from('meal_package_items')
      .select('recipe_id, meal_time, recipes(recipe_name, image_url, calories_kcal, protein_g, carbohydrate_g, fat_g, sugar_g)');

    if (itemsError) throw itemsError;

    // Group by recipe_id to get unique list of active recipes
    const uniqueRecipes = new Map();
    for (const item of packageItems) {
      if (item.recipes && !uniqueRecipes.has(item.recipe_id)) {
        uniqueRecipes.set(item.recipe_id, {
          recipe_id: item.recipe_id,
          recipe_name: item.recipes.recipe_name,
          image_url: item.recipes.image_url,
          calories_kcal: Number(item.recipes.calories_kcal || 0)
        });
      }
    }

    console.log(`Found ${uniqueRecipes.size} recipes mapped to Meal Packages.`);
    console.log('');
    console.log('| Recipe Name | Image | Ingredients | Steps | Calories | Status |');
    console.log('|---|---|---|---|---|---|');

    let allPass = true;

    for (const r of uniqueRecipes.values()) {
      // Query specific counts
      const { count: ingCount, error: ingErr } = await supabaseAdmin
        .from('bahan_resep')
        .select('*', { count: 'exact', head: true })
        .eq('recipe_id', r.recipe_id);

      if (ingErr) throw ingErr;

      const { count: stepCount, error: stepErr } = await supabaseAdmin
        .from('recipe_steps')
        .select('*', { count: 'exact', head: true })
        .eq('recipe_id', r.recipe_id);

      if (stepErr) throw stepErr;

      const hasImage = r.image_url !== null && r.image_url !== '';
      const hasMinIngredients = ingCount >= 3;
      const hasMinSteps = stepCount >= 3;
      const hasCalories = r.calories_kcal > 0;

      let status = 'PASS';
      if (!hasImage || !hasMinIngredients || !hasMinSteps || !hasCalories) {
        status = 'FAIL';
        allPass = false;
        
        const details = [];
        if (!hasImage) details.push('No Image');
        if (!hasMinIngredients) details.push(`Low Ingredients (${ingCount})`);
        if (!hasMinSteps) details.push(`Low Steps (${stepCount})`);
        if (!hasCalories) details.push('0 Calories');
        status = `FAIL (${details.join(', ')})`;
      }

      console.log(`| ${r.recipe_name} | ${r.image_url ? 'YES' : 'NO'} | ${ingCount} | ${stepCount} | ${r.calories_kcal.toFixed(2)} kcal | ${status} |`);
    }

    console.log('');
    if (allPass) {
      console.log('VERIFICATION RESULT: PASS (All recipes are complete!)');
      process.exit(0);
    } else {
      console.log('VERIFICATION RESULT: FAIL (Some recipes are incomplete.)');
      process.exit(1);
    }
  } catch (err) {
    console.error('Verification failed:', err.message);
    process.exit(1);
  }
}

verify();
