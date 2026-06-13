const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function runTests() {
  try {
    console.log('--- SPRINT 2B ENDPOINT TESTING ---');

    // 1. Try registering a test user
    let token = '';
    try {
      const regRes = await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Sprint 2B Tester',
        email: 'tester_sprint2b@healthplate.com',
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
        email: 'tester_sprint2b@healthplate.com',
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

    // 3. Test GET /mealplan/focus
    console.log('\nTesting GET /mealplan/focus...');
    try {
      const res = await axios.get(`${BASE_URL}/mealplan/focus`, { headers });
      console.log('Status:', res.status);
      console.log('Success:', res.data.success);
      console.log('Data count:', res.data.data.length);
      console.log('Sample Data:', res.data.data);
    } catch (err) {
      console.error('GET /mealplan/focus Error:', err.response ? err.response.data : err.message);
    }

    // 4. Test GET /mealplan/packages
    console.log('\nTesting GET /mealplan/packages...');
    let samplePkgId = '';
    try {
      const res = await axios.get(`${BASE_URL}/mealplan/packages`, { headers });
      console.log('Status:', res.status);
      console.log('Success:', res.data.success);
      console.log('Data count:', res.data.data.length);
      console.log('Sample Data:', res.data.data);
      if (res.data.data.length > 0) {
        samplePkgId = res.data.data[0].package_id;
      }
    } catch (err) {
      console.error('GET /mealplan/packages Error:', err.response ? err.response.data : err.message);
    }

    // 5. Test GET /mealplan/packages/:id
    if (samplePkgId) {
      console.log(`\nTesting GET /mealplan/packages/${samplePkgId}...`);
      try {
        const res = await axios.get(`${BASE_URL}/mealplan/packages/${samplePkgId}`, { headers });
        console.log('Status:', res.status);
        console.log('Success:', res.data.success);
        console.log('Package Detail meals:', Object.keys(res.data.data.meals));
        console.log('Detailed Breakfast:', res.data.data.meals.breakfast);
      } catch (err) {
        console.error('GET /mealplan/packages/:id Error:', err.response ? err.response.data : err.message);
      }

      // 6. Test POST /mealplan/apply-package
      console.log('\nTesting POST /mealplan/apply-package...');
      try {
        const res = await axios.post(`${BASE_URL}/mealplan/apply-package`, {
          package_id: samplePkgId,
          date: '2026-06-15'
        }, { headers });
        console.log('Status:', res.status);
        console.log('Success:', res.data.success);
        console.log('Message:', res.data.message);
        console.log('Applied Data:', res.data.data);
      } catch (err) {
        console.error('POST /mealplan/apply-package Error:', err.response ? err.response.data : err.message);
      }
    } else {
      console.log('\nSkipping package details and apply-package tests because no package was found.');
    }

  } catch (err) {
    console.error('Unexpected testing error:', err.message);
  }
}

runTests();
