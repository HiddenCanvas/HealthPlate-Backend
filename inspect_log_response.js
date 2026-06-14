const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function inspect() {
  const email = `inspect_${Date.now()}@healthplate.com`;
  const password = 'Password123!';
  
  try {
    await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Inspect Tester',
      email,
      password
    });
  } catch (err) {}

  const loginRes = await axios.post(`${BASE_URL}/auth/login`, { email, password });
  const token = loginRes.data.data.session.access_token;
  const headers = { Authorization: `Bearer ${token}` };
  
  const todayDate = '2026-06-15';
  
  // 1. Add custom entry
  console.log('Adding custom food entry...');
  await axios.post(`${BASE_URL}/log/${todayDate}/entries/custom`, {
    custom_name: 'Nasi Kuning Custom',
    meal_time: 'Breakfast',
    portion: 150,
    consumed_calories: 350,
    consumed_protein: 8,
    consumed_carbs: 45,
    consumed_fat: 10,
    consumed_sugar: 2
  }, { headers });

  // 2. Fetch the log for today
  console.log('Fetching daily log...');
  const res = await axios.get(`${BASE_URL}/log/${todayDate}`, { headers });
  console.log('Daily Log Response:');
  console.log(JSON.stringify(res.data, null, 2));
}

inspect();
