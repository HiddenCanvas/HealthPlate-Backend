const { supabaseAdmin } = require('./src/config/supabase');

async function inspect() {
  try {
    console.log('--- DB INSPECTION ---');
    
    // Try to query meal_packages columns
    const { data: packages, error: pkgError } = await supabaseAdmin
      .from('meal_packages')
      .select('*')
      .limit(1);

    if (pkgError) {
      console.error('Error querying meal_packages:', pkgError.message);
    } else {
      console.log('Successfully queried meal_packages. Sample:', packages);
    }

    // Try to query focus_categories
    const { data: focus, error: focusError } = await supabaseAdmin
      .from('focus_categories')
      .select('*')
      .limit(1);

    if (focusError) {
      console.error('Error querying focus_categories:', focusError.message);
    } else {
      console.log('Successfully queried focus_categories. Sample:', focus);
    }

    // Try to query meal_package_items
    const { data: items, error: itemsError } = await supabaseAdmin
      .from('meal_package_items')
      .select('*')
      .limit(1);

    if (itemsError) {
      console.error('Error querying meal_package_items:', itemsError.message);
    } else {
      console.log('Successfully queried meal_package_items. Sample:', items);
    }

  } catch (err) {
    console.error('Inspection failed:', err.message);
  }
}

inspect();
