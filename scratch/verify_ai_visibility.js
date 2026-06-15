const axios = require('axios');
const { supabaseAdmin } = require('../src/config/supabase');
const adminMonitoringService = require('../src/services/adminMonitoring.service');

const BASE_URL = 'http://localhost:3000/api/v1';

async function runVerification() {
  console.log('=== SPRINT BF-2A: AI FOOD LOG VISIBILITY VERIFICATION ===\n');

  // 1. Authenticate user
  let token = '';
  let userId = '';
  try {
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Sprint Visibility Tester',
        email: 'tester_visibility@healthplate.com',
        password: 'password123'
      });
    } catch (e) {
      // Ignore if user already exists
    }

    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'tester_visibility@healthplate.com',
      password: 'password123'
    });
    token = loginRes.data.data.session.access_token;
    userId = loginRes.data.data.user.id;
    console.log('✅ Logged in successfully. Token and User ID obtained.');
  } catch (err) {
    const msg = err.response && err.response.data ? JSON.stringify(err.response.data) : err.message;
    console.error('❌ Login failed (ensure the server is running on port 3000):', msg);
    return;
  }

  const headers = { Authorization: `Bearer ${token}` };
  const todayDate = new Date().toISOString().split('T')[0];
  let entryId = '';

  try {
    // 2. Submit AI predicted food log
    console.log('\n--- 1. Submitting AI predicted food log via POST /ai-food ---');
    const aiFoodPayload = {
      food_name: 'Nasi Pecel Madiun',
      quantity: 1,
      unit: 'Porsi',
      estimated_serving_g: 250,
      calories_kcal: 450,
      protein_g: 12.5,
      carbohydrate_g: 65,
      fat_g: 15.2,
      sugar_g: 5.5,
      confidence: 95,
      reasoning: 'Nasi dengan sayuran rebus, bumbu kacang, rempeyek, dan telur rebus.',
      meal_time: 'Breakfast'
    };

    const addRes = await axios.post(`${BASE_URL}/log/${todayDate}/ai-food`, aiFoodPayload, { headers });
    console.log('Response Status:', addRes.status);
    console.log('Response Data:', addRes.data);

    if (addRes.status === 201 && addRes.data.success && addRes.data.data.entry_id) {
      entryId = addRes.data.data.entry_id;
      console.log('✅ AI food entry successfully added. Entry ID:', entryId);
    } else {
      console.error('❌ FAILED: Unexpected response contract on POST /ai-food');
      return;
    }

    // 3. Verify in DB directly that source is 'ai_prediction'
    console.log('\n--- 2. Verifying database entry source is "ai_prediction" ---');
    const { data: dbEntry, error: dbError } = await supabaseAdmin
      .from('log_entries')
      .select('*')
      .eq('entry_id', entryId)
      .single();

    if (dbError || !dbEntry) {
      console.error('❌ FAILED: Could not retrieve entry directly from DB.', dbError?.message);
      return;
    }

    console.log(`DB Entry source: "${dbEntry.source}"`);
    if (dbEntry.source === 'ai_prediction') {
      console.log('✅ Verified: Saved in DB with source "ai_prediction".');
    } else {
      console.error('❌ FAILED: Saved source is not "ai_prediction"!');
      return;
    }

    // 4. Verify log details harian GET /api/v1/log/:date
    console.log('\n--- 3. Verifying GET /api/v1/log/:date ---');
    const logRes = await axios.get(`${BASE_URL}/log/${todayDate}`, { headers });
    console.log('Response Status:', logRes.status);
    
    const logEntries = logRes.data.data.log_entries;
    const mappedEntry = logEntries.find(e => e.entry_id === entryId);

    if (!mappedEntry) {
      console.error('❌ FAILED: AI Entry not found in daily log detail response!');
      return;
    }

    console.log('Found entry in daily log response:', {
      entry_id: mappedEntry.entry_id,
      custom_name: mappedEntry.custom_name,
      source: mappedEntry.source,
      consumed_calories: mappedEntry.consumed_calories
    });

    if (mappedEntry.source === 'manual') {
      console.log('✅ Verified: Response serializer mapped source "ai_prediction" to "manual".');
    } else {
      console.error('❌ FAILED: Response source is still:', mappedEntry.source);
    }

    // Verify daily totals
    const totals = logRes.data.data;
    console.log('Daily log totals:', {
      total_calories: totals.total_calories,
      total_protein: totals.total_protein,
      total_carbs: totals.total_carbs,
      total_fat: totals.total_fat,
      total_sugar: totals.total_sugar
    });

    if (
      Number(totals.total_calories) >= 450 &&
      Number(totals.total_protein) >= 12.5 &&
      Number(totals.total_carbs) >= 65 &&
      Number(totals.total_fat) >= 15.2 &&
      Number(totals.total_sugar) >= 5.5
    ) {
      console.log('✅ Verified: Daily log totals correctly aggregate AI predicted entry nutrients.');
    } else {
      console.error('❌ FAILED: Daily log totals do not match the expected sum of log entries.');
    }

    // 5. Verify Dashboard Summary GET /api/v1/dashboard/summary
    console.log('\n--- 4. Verifying GET /api/v1/dashboard/summary ---');
    const dashRes = await axios.get(`${BASE_URL}/dashboard/summary`, { headers });
    console.log('Response Status:', dashRes.status);
    
    const dashEntries = dashRes.data.data.entries;
    const mappedDashEntry = dashEntries.find(e => e.entry_id === entryId);

    if (!mappedDashEntry) {
      console.error('❌ FAILED: AI Entry not found in dashboard entries response!');
      return;
    }

    console.log('Found entry in dashboard response:', {
      entry_id: mappedDashEntry.entry_id,
      custom_name: mappedDashEntry.custom_name,
      source: mappedDashEntry.source
    });

    if (mappedDashEntry.source === 'manual') {
      console.log('✅ Verified: Dashboard response serializer mapped source "ai_prediction" to "manual".');
    } else {
      console.error('❌ FAILED: Dashboard entry source is:', mappedDashEntry.source);
    }

    const consumedToday = dashRes.data.data.consumed;
    console.log('Dashboard consumed today:', consumedToday);
    if (
      consumedToday.calories >= 450 &&
      consumedToday.protein >= 12.5 &&
      consumedToday.carbohydrate >= 65 &&
      consumedToday.fat >= 15.2 &&
      consumedToday.sugar >= 5.5
    ) {
      console.log('✅ Verified: Dashboard consumed totals aggregate AI predicted entry nutrients.');
    } else {
      console.error('❌ FAILED: Dashboard consumed totals do not match.');
    }

    // 6. Verify Admin Monitoring Logs Service
    console.log('\n--- 5. Verifying Admin Monitoring Logs Service ---');
    const adminLogs = await adminMonitoringService.getLogs({ user_id: userId, date: todayDate });
    const logWithEntries = adminLogs.data.find(log => log.log_id === dbEntry.log_id);

    if (!logWithEntries || !logWithEntries.log_entries) {
      console.error('❌ FAILED: Daily log or entries not returned in admin logs.');
      return;
    }

    const adminEntry = logWithEntries.log_entries.find(e => e.entry_id === entryId);
    if (!adminEntry) {
      console.error('❌ FAILED: AI Entry not found in admin log entries.');
      return;
    }

    console.log('Admin log entry details:', {
      entry_id: adminEntry.entry_id,
      custom_name: adminEntry.custom_name,
      source: adminEntry.source
    });

    if (adminEntry.source === 'manual') {
      console.log('✅ Verified: Admin logs response mapping works correctly.');
    } else {
      console.error('❌ FAILED: Admin log entry source is:', adminEntry.source);
    }

  } catch (err) {
    console.error('❌ Unexpected error during verification:', err.response ? err.response.data : err.message);
  } finally {
    // 7. Cleanup
    if (entryId) {
      console.log('\n--- 6. Cleanup: Deleting test entry ---');
      try {
        await axios.delete(`${BASE_URL}/log/${todayDate}/entries/${entryId}`, { headers });
        console.log('✅ Test entry deleted successfully.');
      } catch (err) {
        console.error('❌ Failed to delete test entry during cleanup:', err.message);
      }
    }
  }
}

runVerification();
