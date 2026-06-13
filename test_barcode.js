const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function runTests() {
  try {
    console.log('--- SPRINT 3C BARCODE TESTING ---');

    // 1. Try registering a test user
    let token = '';
    try {
      const regRes = await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Sprint 3C Tester',
        email: 'tester_sprint3c@healthplate.com',
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

    // 2. Login to get token
    try {
      const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'tester_sprint3c@healthplate.com',
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

    const testBarcode = '5449000000996'; // Coca-Cola (valid global barcode)
    const testDate = new Date().toISOString().split('T')[0];

    // 3. Test GET /api/v1/barcode/:barcode (first lookup: eksternal API/OpenFoodFacts)
    console.log(`\n[Test Case 1a] Looking up barcode ${testBarcode} (may query OFF)...`);
    try {
      const start = Date.now();
      const res = await axios.get(`${BASE_URL}/barcode/${testBarcode}`, { headers });
      const duration = Date.now() - start;
      console.log('Status:', res.status, `(Expected: 200, took ${duration}ms)`);
      console.log('Product data:', res.data.data);
      if (res.data.data.barcode === testBarcode && res.data.data.product_name) {
        console.log('SUCCESS: First lookup successful.');
      } else {
        console.error('FAILED: Invalid product data returned.');
      }
    } catch (err) {
      console.error('FAILED lookup:', err.response ? err.response.data : err.message);
    }

    // 4. Test GET /api/v1/barcode/:barcode again (second lookup: must be cached in database local)
    console.log(`\n[Test Case 1b] Looking up barcode ${testBarcode} again (must use database cache)...`);
    try {
      const start = Date.now();
      const res = await axios.get(`${BASE_URL}/barcode/${testBarcode}`, { headers });
      const duration = Date.now() - start;
      console.log('Status:', res.status, `(Expected: 200, took ${duration}ms - cached)`);
      console.log('Product name:', res.data.data.product_name);
      if (duration < 500) {
        console.log('SUCCESS: Cached database lookup completed extremely fast.');
      } else {
        console.warn('WARNING: Cached lookup took longer than expected.');
      }
    } catch (err) {
      console.error('FAILED cached lookup:', err.response ? err.response.data : err.message);
    }

    // 5. Test Case 1c: Consume barcode valid
    console.log(`\n[Test Case 1c] Consuming barcode ${testBarcode} on ${testDate}...`);
    try {
      const res = await axios.post(`${BASE_URL}/log/${testDate}/consume-barcode`, {
        barcode: testBarcode,
        meal_time: 'Breakfast',
        portion_multiplier: 1.5
      }, { headers });

      console.log('Status:', res.status, '(Expected: 201)');
      console.log('Consume Response:', res.data);
      if (res.status === 201 && res.data.success && res.data.source === 'barcode') {
        console.log('SUCCESS: Barcode consumption successfully logged.');
      } else {
        console.error('FAILED: Invalid response structure or status.');
      }
    } catch (err) {
      console.error('FAILED consume barcode:', err.response ? err.response.data : err.message);
    }

    // 6. Test Case 2: Barcode not found (404)
    const fakeBarcode = '0000000000000';
    console.log(`\n[Test Case 2] Looking up non-existent barcode: ${fakeBarcode}...`);
    try {
      await axios.get(`${BASE_URL}/barcode/${fakeBarcode}`, { headers });
      console.error('FAILED: Expected 404, but request succeeded.');
    } catch (err) {
      if (err.response) {
        console.log('Status:', err.response.status, '(Expected: 404)');
        console.log('Response body:', err.response.data);
      } else {
        console.error('FAILED: Request failed without response:', err.message);
      }
    }

    // 7. Test Case 3: Meal time invalid (400)
    console.log('\n[Test Case 3] Consuming barcode with invalid meal_time ("MidnightSnack")...');
    try {
      await axios.post(`${BASE_URL}/log/${testDate}/consume-barcode`, {
        barcode: testBarcode,
        meal_time: 'MidnightSnack',
        portion_multiplier: 1.0
      }, { headers });
      console.error('FAILED: Expected 400, but request succeeded.');
    } catch (err) {
      if (err.response) {
        console.log('Status:', err.response.status, '(Expected: 400)');
        console.log('Response body:', err.response.data);
      } else {
        console.error('FAILED: Request failed without response:', err.message);
      }
    }

    // 8. Test Case 4: Portion multiplier invalid (400)
    console.log('\n[Test Case 4] Consuming barcode with negative portion_multiplier (-1.0)...');
    try {
      await axios.post(`${BASE_URL}/log/${testDate}/consume-barcode`, {
        barcode: testBarcode,
        meal_time: 'Breakfast',
        portion_multiplier: -1.0
      }, { headers });
      console.error('FAILED: Expected 400, but request succeeded.');
    } catch (err) {
      if (err.response) {
        console.log('Status:', err.response.status, '(Expected: 400)');
        console.log('Response body:', err.response.data);
      } else {
        console.error('FAILED: Request failed without response:', err.message);
      }
    }

    // 9. Test Case 5: Verify E2E update on Dashboard and History
    console.log('\n[Test Case 5] Verifying Daily Log, History, and Dashboard updates E2E...');
    try {
      // Get Dashboard Nutrition
      const dashRes = await axios.get(`${BASE_URL}/dashboard/nutrition`, { headers });
      console.log('Dashboard today calories intake:', dashRes.data.data.today.calories);
      
      // Get History logs
      const histRes = await axios.get(`${BASE_URL}/log/history?limit=1`, { headers });
      console.log('Last logged history item details:');
      console.log(`- Product Name: ${histRes.data.data[0].product_name}`);
      console.log(`- Source: ${histRes.data.data[0].source}`);
      console.log(`- Calories: ${histRes.data.data[0].consumed_calories}`);
      
      if (dashRes.data.data.today.calories > 0 && histRes.data.data[0].source === 'barcode') {
        console.log('SUCCESS: Daily log, dashboard, and history are fully synchronized with scan barcode.');
      } else {
        console.error('FAILED: Discrepancy or synchronization issue in history/dashboard.');
      }
    } catch (err) {
      console.error('FAILED verification:', err.response ? err.response.data : err.message);
    }

  } catch (err) {
    console.error('Unexpected testing error:', err.message);
  }
}

runTests();
