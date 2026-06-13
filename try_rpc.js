const { supabaseAdmin } = require('./src/config/supabase');

async function testRPC() {
  const sql = 'SELECT 1';
  
  // Try common SQL execution RPC names
  const rpcs = ['exec_sql', 'execute_sql', 'run_sql', 'exec', 'query'];
  
  for (const rpc of rpcs) {
    try {
      const { data, error } = await supabaseAdmin.rpc(rpc, { sql });
      if (error) {
        console.log(`RPC ${rpc} failed:`, error.message);
      } else {
        console.log(`RPC ${rpc} succeeded! Data:`, data);
        return;
      }
    } catch (err) {
      console.log(`RPC ${rpc} threw error:`, err.message);
    }
  }
}

testRPC();
