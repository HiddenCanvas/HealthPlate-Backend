const axios = require('axios');
const FormData = require('form-data');

const BASE_URL = 'https://healthplate-backend-production.up.railway.app/api/v1';
const TINY_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

async function testProduction() {
  console.log('=== TESTING PRODUCTION BACKEND FOR AI-FOOD ENDPOINT ===');
  
  // 1. Register a test user
  const email = `test_ai_${Date.now()}@healthplate.com`;
  const password = 'Password123!';
  
  try {
    console.log('Registering user...');
    await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Prod AI Tester',
      email,
      password
    });
  } catch (err) {
    console.log('Register failed (might already exist):', err.message);
  }

  // 2. Login
  let token = '';
  try {
    console.log('Logging in...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password
    });
    token = loginRes.data.data.session.access_token;
    console.log('Login success. Token acquired.');
  } catch (err) {
    console.error('Login failed:', err.message);
    return;
  }

  const headers = { Authorization: `Bearer ${token}` };
  const todayDate = '2026-06-15';

  // Test Case A: Fields added AFTER the file (Old Flutter client behavior)
  console.log('\n--- TEST CASE A: File first, fields last ---');
  try {
    const formDataA = new FormData();
    formDataA.append('image', TINY_PNG, { filename: 'test.png', contentType: 'image/png' });
    formDataA.append('food_name', 'Pepes Ikan');
    formDataA.append('meal_time', 'Lunch');
    formDataA.append('quantity', '1');
    formDataA.append('estimated_serving_g', '150');
    formDataA.append('calories_kcal', '250');
    
    const resA = await axios.post(`${BASE_URL}/log/${todayDate}/ai-food`, formDataA, {
      headers: { ...headers, ...formDataA.getHeaders() }
    });
    console.log('TEST CASE A RESULT: SUCCESS', resA.status, resA.data);
  } catch (err) {
    console.log('TEST CASE A RESULT: FAILED');
    console.log('Status Code:', err.response?.status);
    console.log('Response Body:', err.response?.data);
  }

  // Test Case B: Fields added BEFORE the file (New Flutter client behavior)
  console.log('\n--- TEST CASE B: Fields first, file last ---');
  try {
    const formDataB = new FormData();
    formDataB.append('food_name', 'Pepes Ikan');
    formDataB.append('meal_time', 'Lunch');
    formDataB.append('quantity', '1');
    formDataB.append('estimated_serving_g', '150');
    formDataB.append('calories_kcal', '250');
    formDataB.append('image', TINY_PNG, { filename: 'test.png', contentType: 'image/png' });
    
    const resB = await axios.post(`${BASE_URL}/log/${todayDate}/ai-food`, formDataB, {
      headers: { ...headers, ...formDataB.getHeaders() }
    });
    console.log('TEST CASE B RESULT: SUCCESS', resB.status, resB.data);
  } catch (err) {
    console.log('TEST CASE B RESULT: FAILED');
    console.log('Status Code:', err.response?.status);
    console.log('Response Body:', err.response?.data);
  }

  // Test Case C: Pure JSON Payload (no image)
  console.log('\n--- TEST CASE C: JSON payload, no image ---');
  try {
    const resC = await axios.post(`${BASE_URL}/log/${todayDate}/ai-food`, {
      food_name: 'Pepes Ikan JSON',
      meal_time: 'Lunch',
      quantity: 1,
      estimated_serving_g: 150,
      calories_kcal: 250,
      protein_g: 15,
      carbohydrate_g: 10,
      fat_g: 12,
      sugar_g: 2,
      confidence: 85,
      reasoning: 'Pepes ikan lewat JSON',
      source: 'ai_prediction'
    }, {
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
    console.log('TEST CASE C RESULT: SUCCESS', resC.status, resC.data);
  } catch (err) {
    console.log('TEST CASE C RESULT: FAILED');
    console.log('Status Code:', err.response?.status);
    console.log('Response Body:', err.response?.data);
  }
}

testProduction();
