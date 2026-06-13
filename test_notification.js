const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function runTests() {
  try {
    console.log('=== SPRINT 4B NOTIFICATION SYSTEM TESTING ===');

    // 1. Register/Login user
    let token = '';
    try {
      const regRes = await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Sprint 4B Tester',
        email: 'tester_sprint4b@healthplate.com',
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
        email: 'tester_sprint4b@healthplate.com',
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

    // Test 1: Simpan FCM token
    console.log('\n--- Test 1: Simpan FCM Token ---');
    try {
      const tokenRes = await axios.post(`${BASE_URL}/notification/token`, {
        fcm_token: 'mock_token_sprint4b_12345'
      }, { headers });
      console.log('Status:', tokenRes.status, '(Expected: 200)');
      console.log('Response:', tokenRes.data);
    } catch (err) {
      console.error('Test 1 Failed:', err.response ? err.response.data : err.message);
    }

    // Test 2: Create notification
    console.log('\n--- Test 2: Create Notification ---');
    let notificationId = '';
    try {
      const createRes = await axios.post(`${BASE_URL}/notification/`, {
        title: 'Calorie Limit Reached',
        message: 'You have consumed 95% of your daily calorie target.',
        type: 'calorie_alert'
      }, { headers });
      console.log('Status:', createRes.status, '(Expected: 201)');
      console.log('Response:', createRes.data);
      notificationId = createRes.data.data.notification_id;
    } catch (err) {
      console.error('Test 2 Failed:', err.response ? err.response.data : err.message);
    }

    // Test 3: Get notification list
    console.log('\n--- Test 3: Get Notification List ---');
    try {
      const listRes = await axios.get(`${BASE_URL}/notification?page=1&limit=5`, { headers });
      console.log('Status:', listRes.status, '(Expected: 200)');
      console.log('Response:', listRes.data);
    } catch (err) {
      console.error('Test 3 Failed:', err.response ? err.response.data : err.message);
    }

    // Test 4: Mark single notification as read
    console.log('\n--- Test 4: Mark Single Notification as Read ---');
    if (notificationId) {
      try {
        const readRes = await axios.patch(`${BASE_URL}/notification/${notificationId}/read`, {}, { headers });
        console.log('Status:', readRes.status, '(Expected: 200)');
        console.log('Response:', readRes.data);
      } catch (err) {
        console.error('Test 4 Failed:', err.response ? err.response.data : err.message);
      }
    } else {
      console.log('Skipping Test 4: notificationId is missing.');
    }

    // Test 5: Mark all notifications as read
    console.log('\n--- Test 5: Mark All Notifications as Read ---');
    try {
      const readAllRes = await axios.patch(`${BASE_URL}/notification/read-all`, {}, { headers });
      console.log('Status:', readAllRes.status, '(Expected: 200)');
      console.log('Response:', readAllRes.data);
    } catch (err) {
      console.error('Test 5 Failed:', err.response ? err.response.data : err.message);
    }

    // Test 6: Notification settings update (GET & PUT)
    console.log('\n--- Test 6: Get & Update Notification Settings ---');
    try {
      const getSettingsRes = await axios.get(`${BASE_URL}/notification/settings`, { headers });
      console.log('GET Settings Status:', getSettingsRes.status, '(Expected: 200)');
      console.log('GET Settings Response:', getSettingsRes.data);

      const putSettingsRes = await axios.put(`${BASE_URL}/notification/settings`, {
        push_enabled: false,
        mealplan_enabled: true,
        reminder_enabled: false,
        article_enabled: true
      }, { headers });
      console.log('PUT Settings Status:', putSettingsRes.status, '(Expected: 200)');
      console.log('PUT Settings Response:', putSettingsRes.data);
    } catch (err) {
      console.error('Test 6 Failed:', err.response ? err.response.data : err.message);
    }

  } catch (err) {
    console.error('Unexpected testing error:', err.message);
  }
}

runTests();
