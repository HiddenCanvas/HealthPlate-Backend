const { supabaseAdmin } = require('../src/config/supabase');

async function checkConstraints() {
  try {
    console.log('--- CHECK CONSTRAINTS IN DB ---');
    
    // We can run an RPC if it exists, but since no direct exec SQL RPC is available,
    // let's query some system tables via select, but wait! We don't have direct tables access forpg_catalog.
    // Wait, let's check if we can query pg_catalog tables via supabase client.
    // The supabaseAdmin client only allows querying tables in the schemas exposed to PostgREST (usually 'public').
    // Since pg_catalog is not exposed, we cannot do .from('pg_catalog.pg_constraint').
    // But wait! Is there any table named 'log_entries' constraints we can check?
    // Let's try inserting an entry with an invalid source to see what error the database returns.
    console.log('Testing constraint by trying to insert invalid source...');
    const { data, error } = await supabaseAdmin
      .from('log_entries')
      .insert({
        log_id: 'a0a1960c-88f2-4ba7-90d5-107e1437b07e', // use any UUID or valid log ID
        meal_time: 'Lunch',
        portion: 1,
        source: 'invalid_source_test'
      });
    
    if (error) {
      console.log('Insert failed (expected):', error.message);
    } else {
      console.log('Insert succeeded! (this means there is no check constraint blocking it!)');
    }
  } catch (err) {
    console.error('Failed:', err.message);
  }
}

checkConstraints();
