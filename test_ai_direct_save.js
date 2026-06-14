const axios = require('axios');
const { supabaseAdmin } = require('./src/config/supabase');

const BASE_URL = 'http://localhost:3000/api/v1';

async function runTests() {
  console.log('=== SPRINT BE-5.2: AI NUTRITION DIRECT SAVE TESTING ===\n');

  // 1. Authenticate user
  let token = '';
  try {
    // Attempt registration first
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Sprint 5.2 Tester',
        email: 'tester_sprint52@healthplate.com',
        password: 'password123'
      });
    } catch (e) {
      // Ignore if user already exists
    }

    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'tester_sprint52@healthplate.com',
      password: 'password123'
    });
    token = loginRes.data.data.session.access_token;
    console.log('✅ Logged in successfully. Token obtained.');
  } catch (err) {
    const msg = err.response && err.response.data ? JSON.stringify(err.response.data) : err.message;
    console.error('❌ Login failed (ensure the server is running on port 3000):', msg);
    return;
  }

  const headers = { Authorization: `Bearer ${token}` };
  const testDate = '2026-06-18';

  // Test Case 1: Missing food_name
  console.log('\n--- Test 1: Missing food_name ---');
  try {
    await axios.post(`${BASE_URL}/log/${testDate}/ai-food`, {
      meal_time: 'Lunch',
      calories_kcal: 200
    }, { headers });
    console.error('❌ FAILED: Allowed request without food_name');
  } catch (err) {
    if (err.response && err.response.status === 400) {
      console.log('✅ PASSED: Returned HTTP 400 Bad Request.', err.response.data);
    } else {
      console.error('❌ FAILED: Unexpected status:', err.response?.status, err.message);
    }
  }

  // Test Case 2: Missing meal_time
  console.log('\n--- Test 2: Missing meal_time ---');
  try {
    await axios.post(`${BASE_URL}/log/${testDate}/ai-food`, {
      food_name: 'Nasi Goreng',
      calories_kcal: 200
    }, { headers });
    console.error('❌ FAILED: Allowed request without meal_time');
  } catch (err) {
    if (err.response && err.response.status === 400) {
      console.log('✅ PASSED: Returned HTTP 400 Bad Request.', err.response.data);
    } else {
      console.error('❌ FAILED: Unexpected status:', err.response?.status, err.message);
    }
  }

  // Test Case 3: Invalid meal_time value
  console.log('\n--- Test 3: Invalid meal_time ---');
  try {
    await axios.post(`${BASE_URL}/log/${testDate}/ai-food`, {
      food_name: 'Nasi Goreng',
      meal_time: 'MidnightSnack',
      calories_kcal: 200
    }, { headers });
    console.error('❌ FAILED: Allowed request with invalid meal_time');
  } catch (err) {
    if (err.response && err.response.status === 400) {
      console.log('✅ PASSED: Returned HTTP 400 Bad Request.', err.response.data);
    } else {
      console.error('❌ FAILED: Unexpected status:', err.response?.status, err.message);
    }
  }

  // Test Case 4: Negative nutrient value
  console.log('\n--- Test 4: Negative nutrient values ---');
  try {
    await axios.post(`${BASE_URL}/log/${testDate}/ai-food`, {
      food_name: 'Nasi Goreng',
      meal_time: 'Lunch',
      calories_kcal: -100
    }, { headers });
    console.error('❌ FAILED: Allowed negative nutrient value');
  } catch (err) {
    if (err.response && err.response.status === 400) {
      console.log('✅ PASSED: Returned HTTP 400 Bad Request.', err.response.data);
    } else {
      console.error('❌ FAILED: Unexpected status:', err.response?.status, err.message);
    }
  }

  // Test Case 5: Successful AI Food Save
  console.log('\n--- Test 5: Successful AI Food Save ---');
  let entryId = '';
  try {
    const res = await axios.post(`${BASE_URL}/log/${testDate}/ai-food`, {
      food_name: 'Nasi Goreng Special',
      quantity: 1,
      unit: 'Porsi',
      estimated_serving_g: 350,
      calories_kcal: 680,
      protein_g: 18.5,
      carbohydrate_g: 85.2,
      fat_g: 22.1,
      sugar_g: 6.4,
      confidence: 92,
      reasoning: 'Nasi goreng disajikan dengan telur mata sapi dan irisan daging ayam.',
      meal_time: 'Lunch',
      source: 'ai_prediction'
    }, { headers });

    console.log('Status:', res.status, '(Expected: 201)');
    console.log('Response data:', res.data);

    if (res.status === 201 && res.data.success && res.data.data.entry_id) {
      entryId = res.data.data.entry_id;
      console.log('✅ PASSED: AI Food logged successfully.');
    } else {
      console.error('❌ FAILED: Response did not match response contract.');
      return;
    }
  } catch (err) {
    console.error('❌ FAILED: Error during POST /ai-food:', err.response ? err.response.data : err.message);
    return;
  }

  // Test Case 6: Direct Database Check via Supabase Admin Client
  console.log('\n--- Test 6: Database Verification ---');
  if (entryId) {
    try {
      const { data: entry, error } = await supabaseAdmin
        .from('log_entries')
        .select('*')
        .eq('entry_id', entryId)
        .single();
      
      if (error || !entry) {
        console.error('❌ FAILED: Could not query the newly created log entry from DB.', error?.message);
      } else {
        console.log('Entry retrieved from database:', entry);
        
        const isMapppedCorrectly = 
          entry.custom_name === 'Nasi Goreng Special' &&
          entry.product_id === null &&
          entry.recipe_id === null &&
          entry.source === 'ai_prediction' &&
          entry.ai_confidence === 92 &&
          entry.ai_reasoning === 'Nasi goreng disajikan dengan telur mata sapi dan irisan daging ayam.' &&
          Number(entry.consumed_calories) === 680 &&
          Number(entry.consumed_protein) === 18.5 &&
          Number(entry.consumed_carbs) === 85.2 &&
          Number(entry.consumed_fat) === 22.1 &&
          Number(entry.consumed_sugar) === 6.4;

        if (isMapppedCorrectly) {
          console.log('✅ PASSED: Database columns mapped and metadata fields saved correctly.');
        } else {
          console.error('❌ FAILED: Database data does not match input request.');
        }
      }
    } catch (err) {
      console.error('❌ FAILED: Exception during database query:', err.message);
    }
  }

  // Test Case 7: Daily Log Totals Recalculation Check
  console.log('\n--- Test 7: Daily Log Aggregation Check ---');
  try {
    const summaryRes = await axios.get(`${BASE_URL}/log/${testDate}`, { headers });
    console.log('Daily Summary data:', summaryRes.data.data);
    
    const totals = summaryRes.data.data;
    if (Number(totals.total_calories) >= 680 && Number(totals.total_protein) >= 18.5) {
      console.log('✅ PASSED: Daily log recalculated successfully.');
    } else {
      console.error('❌ FAILED: Daily log totals not matching the log entry values.');
    }
  } catch (err) {
    console.error('❌ FAILED: Error fetching daily summary:', err.response ? err.response.data : err.message);
  }
}

runTests();
