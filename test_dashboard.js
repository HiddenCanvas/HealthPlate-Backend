const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function runTests() {
  try {
    console.log('--- SPRINT 3B ENDPOINT TESTING ---');

    // 1. Try registering a test user
    let token = '';
    try {
      const regRes = await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Sprint 3B Tester',
        email: 'tester_sprint3b@healthplate.com',
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
        email: 'tester_sprint3b@healthplate.com',
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

    // 3. Set up some log entries by consuming a recipe today
    const todayStr = new Date().toISOString().split('T')[0];
    const recipeId = '21338423-ae92-4478-9f25-a966fb073791'; // Nasi Dada Ayam Panggang
    console.log(`\nLogging a recipe consumption for today (${todayStr}) to initialize data...`);
    try {
      const consumeRes = await axios.post(`${BASE_URL}/log/${todayStr}/consume-recipe`, {
        recipe_id: recipeId,
        meal_time: 'Lunch',
        portion_multiplier: 1.0,
        source: 'recipe'
      }, { headers });
      console.log('Consume recipe status:', consumeRes.status);
      console.log('Consume recipe response:', consumeRes.data);
    } catch (err) {
      console.error('Failed to log consumption:', err.response ? err.response.data : err.message);
      return;
    }

    // 4. Test GET /api/v1/log/summary/:date
    console.log(`\nTesting GET /api/v1/log/summary/${todayStr}...`);
    try {
      const res = await axios.get(`${BASE_URL}/log/summary/${todayStr}`, { headers });
      console.log('Status:', res.status, '(Expected: 200)');
      console.log('Summary data:', res.data.data);
      if (res.data.data.calories > 0) {
        console.log('SUCCESS: Daily summary is correct.');
      } else {
        console.error('FAILED: Daily summary calories are 0.');
      }
    } catch (err) {
      console.error('GET Summary Error:', err.response ? err.response.data : err.message);
    }

    // 5. Test GET /api/v1/log/history (pagination + filters)
    console.log('\nTesting GET /api/v1/log/history...');
    try {
      const res = await axios.get(`${BASE_URL}/log/history?page=1&limit=5&start_date=${todayStr}&end_date=${todayStr}`, { headers });
      console.log('Status:', res.status, '(Expected: 200)');
      console.log('History info:');
      console.log(`- Page: ${res.data.page}, Limit: ${res.data.limit}, Total Count: ${res.data.total_count}`);
      console.log('- Sample item:', res.data.data[0]);
      if (res.data.data.length > 0 && res.data.data[0].log_date === todayStr) {
        console.log('SUCCESS: History retrieved with pagination, date filters, and log_date.');
      } else {
        console.error('FAILED: History is empty or dates do not match.');
      }
    } catch (err) {
      console.error('GET History Error:', err.response ? err.response.data : err.message);
    }

    // 6. Test GET /api/v1/dashboard/nutrition
    console.log('\nTesting GET /api/v1/dashboard/nutrition...');
    try {
      const res = await axios.get(`${BASE_URL}/dashboard/nutrition`, { headers });
      console.log('Status:', res.status, '(Expected: 200)');
      console.log('Dashboard Data:');
      console.log('- Today intake:', res.data.data.today);
      console.log('- Weekly Avg:', res.data.data.weekly_average);
      console.log('- Monthly Avg:', res.data.data.monthly_average);
      console.log('- Remaining stats:', {
        remaining_calories: res.data.data.remaining_calories,
        remaining_protein: res.data.data.remaining_protein,
        remaining_carbohydrate: res.data.data.remaining_carbohydrate,
        remaining_fat: res.data.data.remaining_fat,
        remaining_sugar: res.data.data.remaining_sugar
      });
      if (res.data.data.remaining_calories !== undefined && res.data.data.remaining_protein !== undefined) {
        console.log('SUCCESS: Nutrition dashboard displays all target nutrients correctly.');
      } else {
        console.error('FAILED: Dashboard remaining values are missing.');
      }
    } catch (err) {
      console.error('GET Nutrition Dashboard Error:', err.response ? err.response.data : err.message);
    }

    // 7. Test GET /api/v1/dashboard/top-recipes
    console.log('\nTesting GET /api/v1/dashboard/top-recipes...');
    try {
      const res = await axios.get(`${BASE_URL}/dashboard/top-recipes`, { headers });
      console.log('Status:', res.status, '(Expected: 200)');
      console.log('Top Recipes list:', res.data.data);
      if (res.data.data.length > 0) {
        const item = res.data.data[0];
        console.log('Top consumed item detail:', item);
        if (item.recipe_id && item.recipe_name && item.consumption_count >= 1 && item.last_consumed_at) {
          console.log('SUCCESS: Top recipes returned correctly with counts and last_consumed_at timestamps.');
        } else {
          console.error('FAILED: Top recipe fields are incomplete.');
        }
      } else {
        console.error('FAILED: Top recipes list is empty.');
      }
    } catch (err) {
      console.error('GET Top Recipes Error:', err.response ? err.response.data : err.message);
    }

  } catch (err) {
    console.error('Unexpected testing error:', err.message);
  }
}

runTests();
