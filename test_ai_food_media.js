const axios = require('axios');
const { supabaseAdmin } = require('./src/config/supabase');

const BASE_URL = 'http://localhost:3000/api/v1';
const TINY_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

async function runTests() {
  console.log('=== RUNNING BACKEND SPRINT BF-3B VALIDATION: AI FOOD LOG MEDIA ATTACHMENT ===\n');

  // 1. Log in or create test user
  let token = '';
  let userId = '';
  try {
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Sprint Media Tester',
        email: 'tester_media@healthplate.com',
        password: 'password123'
      });
    } catch (e) {
      // Ignore if user already exists
    }

    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'tester_media@healthplate.com',
      password: 'password123'
    });
    token = loginRes.data.data.session.access_token;
    userId = loginRes.data.data.user.id;
    console.log('✅ Auth success. Token and User ID acquired.');
  } catch (err) {
    const msg = err.response && err.response.data ? JSON.stringify(err.response.data) : err.message;
    console.error('❌ Login failed (is the backend server running on port 3000?):', msg);
    process.exit(1);
  }

  const headers = { Authorization: `Bearer ${token}` };
  const todayDate = new Date().toISOString().split('T')[0];
  let createdEntryId = '';

  try {
    // Test 1: Upload without image (Must fail with 400)
    console.log('\nTest 1: Post AI food without image...');
    try {
      const formData = new FormData();
      formData.append('food_name', 'Test No Image');
      formData.append('meal_time', 'Lunch');
      await axios.post(`${BASE_URL}/log/${todayDate}/ai-food`, formData, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' }
      });
      console.error('❌ Failed: Request succeeded but should have failed.');
      process.exit(1);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('✅ Success: Received 400 Bad Request as expected.');
        console.log('Response msg:', err.response.data.message);
      } else {
        console.error('❌ Failed: Unexpected response:', err.response ? err.response.status : err.message);
        process.exit(1);
      }
    }

    // Test 2: Upload with invalid fields (Must fail with 400)
    console.log('\nTest 2: Post AI food with image but missing food_name...');
    try {
      const formData = new FormData();
      const fileBlob = new Blob([TINY_PNG], { type: 'image/png' });
      formData.append('image', fileBlob, 'test.png');
      formData.append('meal_time', 'Lunch');
      await axios.post(`${BASE_URL}/log/${todayDate}/ai-food`, formData, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' }
      });
      console.error('❌ Failed: Request succeeded but should have failed.');
      process.exit(1);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('✅ Success: Received 400 Bad Request as expected.');
        console.log('Response msg:', err.response.data.message);
      } else {
        console.error('❌ Failed: Unexpected response:', err.response ? err.response.status : err.message);
        process.exit(1);
      }
    }

    // Test 3: Valid upload with image (Must succeed 201)
    console.log('\nTest 3: Post AI food with valid image and payload...');
    const formData = new FormData();
    const fileBlob = new Blob([TINY_PNG], { type: 'image/png' });
    formData.append('image', fileBlob, 'pepes_ikan.png');
    formData.append('food_name', 'Pepes Ikan');
    formData.append('meal_time', 'Dinner');
    formData.append('quantity', '1');
    formData.append('estimated_serving_g', '150');
    formData.append('calories_kcal', '250');
    formData.append('protein_g', '18.5');
    formData.append('carbohydrate_g', '4.2');
    formData.append('fat_g', '15.0');
    formData.append('sugar_g', '1.1');
    formData.append('confidence', '94');
    formData.append('reasoning', 'Ikan pepes dengan bumbu rempah dibungkus daun pisang.');

    const res = await axios.post(`${BASE_URL}/log/${todayDate}/ai-food`, formData, {
      headers: { ...headers, 'Content-Type': 'multipart/form-data' }
    });

    if (res.status === 201 && res.data.success && res.data.data.entry_id) {
      createdEntryId = res.data.data.entry_id;
      console.log('✅ Success: Response is 201 Created.');
      console.log('Created Entry ID:', createdEntryId);
      console.log('Returned image_url:', res.data.data.image_url);
    } else {
      console.error('❌ Failed: Unexpected response:', res.status, res.data);
      process.exit(1);
    }

    // Test 4: Check database persistence directly
    console.log('\nTest 4: Querying database to verify fields...');
    const { data: dbEntry, error: dbError } = await supabaseAdmin
      .from('log_entries')
      .select('*')
      .eq('entry_id', createdEntryId)
      .single();

    if (dbError || !dbEntry) {
      console.error('❌ Failed to retrieve entry from database:', dbError?.message);
      process.exit(1);
    }

    console.log('Saved entry values in DB:');
    console.log('- source:', dbEntry.source);
    console.log('- image_url:', dbEntry.image_url);
    console.log('- ai_image_path:', dbEntry.ai_image_path);
    console.log('- ai_confidence:', dbEntry.ai_confidence);
    console.log('- ai_reasoning:', dbEntry.ai_reasoning);

    if (dbEntry.source !== 'ai_prediction') {
      console.error('❌ Failed: DB source must be "ai_prediction". Got:', dbEntry.source);
      process.exit(1);
    }
    if (!dbEntry.image_url) {
      console.error('❌ Failed: image_url is missing.');
      process.exit(1);
    }
    if (!dbEntry.ai_image_path) {
      console.error('❌ Failed: ai_image_path is missing.');
      process.exit(1);
    }
    if (dbEntry.ai_confidence !== 94) {
      console.error('❌ Failed: ai_confidence mismatch.');
      process.exit(1);
    }
    console.log('✅ Success: All DB properties verified.');

    // Test 5: Verify via Daily Log endpoint GET /log/:date
    console.log('\nTest 5: Verifying GET /log/:date contains image and prediction source...');
    const logRes = await axios.get(`${BASE_URL}/log/${todayDate}`, { headers });
    const logEntries = logRes.data.data.log_entries;
    const mappedEntry = logEntries.find(e => e.entry_id === createdEntryId);

    if (!mappedEntry) {
      console.error('❌ Failed: Entry not found in daily log.');
      process.exit(1);
    }

    console.log('Daily log endpoint returned entry:');
    console.log('- source:', mappedEntry.source);
    console.log('- image_url:', mappedEntry.image_url);

    if (mappedEntry.source !== 'ai_prediction') {
      console.error('❌ Failed: Mapped source should be preserved as "ai_prediction"!');
      process.exit(1);
    }
    if (mappedEntry.image_url !== dbEntry.image_url) {
      console.error('❌ Failed: Image url mismatch.');
      process.exit(1);
    }
    console.log('✅ Success: GET /log/:date serialization verified.');

  } catch (err) {
    console.error('❌ Unexpected error during validation:', err.response ? err.response.data : err.message);
    process.exit(1);
  } finally {
    // 6. Cleanup
    if (createdEntryId) {
      console.log('\nCleanup: Deleting test entry...');
      try {
        await axios.delete(`${BASE_URL}/log/${todayDate}/entries/${createdEntryId}`, { headers });
        console.log('✅ Success: Test entry deleted.');
      } catch (err) {
        console.error('❌ Failed to clean up entry:', err.message);
      }
    }
    console.log('\n=== ALL BACKEND VALIDATIONS PASSED ===');
  }
}

runTests();
