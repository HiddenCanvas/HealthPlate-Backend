const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function runTests() {
  try {
    console.log('--- SPRINT 4A.1 LOG IMAGE UPLOAD TESTING ---');

    // 1. Register/Login user
    let token = '';
    try {
      const regRes = await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Sprint 4A.1 Tester',
        email: 'tester_sprint4a1@healthplate.com',
        password: 'password123'
      });
      console.log('Register response:', regRes.data.message);
    } catch (err) {
      if (err.response && err.response.data) {
        console.log('Register error (expected if already exists):', err.response.data.message);
      } else {
        console.error('Register failed:', err.message);
      }
    }

    try {
      const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'tester_sprint4a1@healthplate.com',
        password: 'password123'
      });
      token = loginRes.data.data.session.access_token;
      console.log('Logged in successfully. Token obtained.');
    } catch (err) {
      const errMsg = err.response && err.response.data ? err.response.data.message : err.message;
      console.error('Login failed:', errMsg);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Fetch a food product to create an entry
    console.log('\nFetching foods list...');
    let productId = '';
    try {
      const foodsRes = await axios.get(`${BASE_URL}/nutrition/foods`, { headers });
      if (foodsRes.data && foodsRes.data.data && foodsRes.data.data.length > 0) {
        productId = foodsRes.data.data[0].product_id;
        console.log(`Found food product: "${foodsRes.data.data[0].product_name}" with ID: ${productId}`);
      } else {
        console.error('No foods found in database.');
        return;
      }
    } catch (err) {
      console.error('Failed to fetch foods:', err.response ? err.response.data : err.message);
      return;
    }

    // 3. Create a daily log entry
    const testDate = '2026-06-17';
    console.log(`\nCreating daily log entry on ${testDate}...`);
    let entryId = '';
    try {
      const entryRes = await axios.post(`${BASE_URL}/log/${testDate}/entries`, {
        product_id: productId,
        meal_time: 'Lunch',
        portion: 150
      }, { headers });
      entryId = entryRes.data.data.entry_id;
      console.log(`Log entry created successfully. Entry ID: ${entryId}`);
    } catch (err) {
      console.error('Failed to create log entry:', err.response ? err.response.data : err.message);
      return;
    }

    // 4. Test uploading log image (E2E)
    console.log(`\nUploading log image for entry ${entryId}...`);
    try {
      const formData = new FormData();
      const fileBlob = new Blob(['dummy image content for food log'], { type: 'image/png' });
      formData.append('image', fileBlob, 'food_log_test.png');

      const res = await axios.post(`${BASE_URL}/upload/log/${entryId}`, formData, {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Status:', res.status, '(Expected: 200)');
      console.log('Response data:', res.data);

      if (res.status === 200 && res.data.success && res.data.data.image_url) {
        console.log('SUCCESS: Image uploaded and updated in DB.');
        console.log('Uploaded image URL:', res.data.data.image_url);
      } else {
        console.error('FAILED: Invalid response details.');
      }
    } catch (err) {
      console.error('FAILED uploading log image:', err.response ? err.response.data : err.message);
    }

  } catch (err) {
    console.error('Unexpected testing error:', err.message);
  }
}

runTests();
