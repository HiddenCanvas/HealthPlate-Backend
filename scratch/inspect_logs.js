const { supabaseAdmin } = require('../src/config/supabase');

async function checkDb() {
  try {
    console.log('--- FETCHING RECENT LOG ENTRIES ---');
    const { data: entries, error: err1 } = await supabaseAdmin
      .from('log_entries')
      .select('*, food_products(product_name)')
      .order('created_at', { ascending: false })
      .limit(10);

    if (err1) {
      console.error('Error fetching log entries:', err1);
    } else {
      console.log('Recent log entries:');
      entries.forEach(e => {
        console.log(`ID: ${e.entry_id}, Source: ${e.source}, Custom Name: ${e.custom_name}, Product: ${e.food_products?.product_name || 'NULL'}, Calories: ${e.consumed_calories}`);
      });
    }

    console.log('\n--- FETCHING DISTINCT SOURCES ---');
    const { data: sources, error: err2 } = await supabaseAdmin
      .from('log_entries')
      .select('source');

    if (err2) {
      console.error('Error fetching distinct sources:', err2);
    } else {
      const uniqueSources = [...new Set(sources.map(s => s.source))];
      console.log('Unique sources in DB:', uniqueSources);
    }
  } catch (err) {
    console.error('Database connection or query failed:', err.message);
  }
}

checkDb();
