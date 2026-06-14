const { supabaseAdmin } = require('./src/config/supabase');

async function checkSchema() {
  console.log('Querying database log_entries table columns...');
  const { data, error } = await supabaseAdmin
    .from('log_entries')
    .select('entry_id, image_url, ai_image_path')
    .limit(1);

  if (error) {
    console.error('❌ Columns check failed:', error.message);
  } else {
    console.log('✅ Columns exist! Result:', data);
  }
}

checkSchema();
