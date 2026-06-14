const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000/api/v1';

// 1x1 pixel transparent PNG
const TINY_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
// 1x1 pixel JPEG
const TINY_JPG = Buffer.from('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=', 'base64');
// 1x1 pixel WEBP
const TINY_WEBP = Buffer.from('UklGRhoAAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=', 'base64');
// Large 6MB dummy buffer
const LARGE_DUMMY_JPG = Buffer.alloc(6 * 1024 * 1024, 0xFF);
LARGE_DUMMY_JPG[0] = 0xFF;
LARGE_DUMMY_JPG[1] = 0xD8;
LARGE_DUMMY_JPG[2] = 0xFF;

async function runTests() {
  console.log('=== SPRINT BE-5.0: AI FOOD NUTRITION PREDICTION TESTING ===\n');

  // 1. Get access token
  let token = '';
  try {
    // Attempt registration first
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Sprint 5 Tester',
        email: 'tester_sprint5@healthplate.com',
        password: 'password123'
      });
    } catch (e) {
      // Ignore if user already exists
    }

    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'tester_sprint5@healthplate.com',
      password: 'password123'
    });
    token = loginRes.data.data.session.access_token;
    console.log('✅ Logged in successfully. Token obtained.');
  } catch (err) {
    const msg = err.response && err.response.data ? JSON.stringify(err.response.data) : err.message;
    console.error('❌ Login failed (ensure the server is running on port 3000):', msg);
    console.log('\nStarting local service-level unit tests anyway...\n');
    await runServiceTests();
    return;
  }

  const headers = { Authorization: `Bearer ${token}` };

  // Test Case 1: Unauthorized access
  console.log('\n--- Test 1: Unauthorized access (Missing token) ---');
  try {
    await axios.post(`${BASE_URL}/ai/predict-food`, {});
    console.error('❌ FAILED: Allowed request without authorization');
  } catch (err) {
    if (err.response && err.response.status === 401) {
      console.log('✅ PASSED: Returned HTTP 401 Unauthorized.');
    } else {
      console.error('❌ FAILED: Unexpected status:', err.response?.status, err.message);
    }
  }

  // Test Case 2: Missing image file
  console.log('\n--- Test 2: Missing image file ---');
  try {
    const formData = new FormData();
    formData.append('description', 'Ayam bakar lezat');
    await axios.post(`${BASE_URL}/ai/predict-food`, formData, { headers });
    console.error('❌ FAILED: Allowed request without image');
  } catch (err) {
    if (err.response && err.response.status === 400) {
      console.log('✅ PASSED: Returned HTTP 400 Bad Request.', err.response.data);
    } else {
      console.error('❌ FAILED: Unexpected status:', err.response?.status, err.message);
    }
  }

  // Test Case 3: Invalid file format (e.g. text file instead of image)
  console.log('\n--- Test 3: Invalid file format ---');
  try {
    const formData = new FormData();
    const textBlob = new Blob(['Not an image content'], { type: 'text/plain' });
    formData.append('image', textBlob, 'test.txt');
    await axios.post(`${BASE_URL}/ai/predict-food`, formData, { headers });
    console.error('❌ FAILED: Allowed invalid file format');
  } catch (err) {
    if (err.response && err.response.status === 400) {
      console.log('✅ PASSED: Returned HTTP 400 Bad Request for invalid format.', err.response.data);
    } else {
      console.error('❌ FAILED: Unexpected status:', err.response?.status, err.message);
    }
  }

  // Test Case 4: File size limit (6MB, > 5MB limit)
  console.log('\n--- Test 4: File size limit (> 5 MB) ---');
  try {
    const formData = new FormData();
    const largeBlob = new Blob([LARGE_DUMMY_JPG], { type: 'image/jpeg' });
    formData.append('image', largeBlob, 'large_food.jpg');
    
    await axios.post(`${BASE_URL}/ai/predict-food`, formData, { headers });
    console.error('❌ FAILED: Allowed upload greater than 5 MB');
  } catch (err) {
    if (err.response && err.response.status === 413) {
      console.log('✅ PASSED: Returned HTTP 413 Payload Too Large.');
    } else {
      console.error('❌ FAILED: Unexpected status:', err.response?.status, err.message);
    }
  }

  // Test Case 5: Real or Mock prediction E2E
  console.log('\n--- Test 5: AI Prediction Endpoint ---');
  const envConfig = require('./src/config/env');
  if (!envConfig.GEMINI_API_KEY || envConfig.GEMINI_API_KEY === 'xxxxx') {
    console.log('⚠️ GEMINI_API_KEY is not configured or is placeholder in server.');
    console.log('Testing 503 fallback behavior...');
    try {
      const formData = new FormData();
      const imgBlob = new Blob([TINY_PNG], { type: 'image/png' });
      formData.append('image', imgBlob, 'food.png');
      
      await axios.post(`${BASE_URL}/ai/predict-food`, formData, { headers });
      console.error('❌ FAILED: Did not return 503 for unconfigured key');
    } catch (err) {
      if (err.response && err.response.status === 503) {
        console.log('✅ PASSED: Returned HTTP 503 Service Unavailable.', err.response.data);
      } else {
        console.error('❌ FAILED: Unexpected status:', err.response?.status, err.message);
      }
    }
  } else {
    console.log('🔑 GEMINI_API_KEY is configured on the server. Performing E2E prediction with 1x1 image...');
    try {
      const formData = new FormData();
      const imgBlob = new Blob([TINY_JPG], { type: 'image/jpeg' });
      formData.append('image', imgBlob, 'food.jpg');
      formData.append('description', 'Ayam Bakar');

      const res = await axios.post(`${BASE_URL}/ai/predict-food`, formData, { headers });
      console.log('✅ PASSED: Status 200 OK');
      console.log('Prediction Response Data:', JSON.stringify(res.data, null, 2));
    } catch (err) {
      console.error('❌ FAILED: Real E2E prediction failed:', err.response ? err.response.data : err.message);
    }
  }

  console.log('\nRunning Service-Level Unit Tests...\n');
  await runServiceTests();
}

async function runServiceTests() {
  const aiService = require('./src/services/ai.service');
  
  // Test Magic Number MIME Detection
  console.log('--- Unit Test: MIME Type Detection ---');
  const mimePng = aiService.detectMimeType(TINY_PNG);
  const mimeJpg = aiService.detectMimeType(TINY_JPG);
  const mimeWebp = aiService.detectMimeType(TINY_WEBP);
  const mimeDefault = aiService.detectMimeType(Buffer.from('random data'));
  
  console.log(`PNG detected: ${mimePng} (Expected: image/png) -> ${mimePng === 'image/png' ? '✅' : '❌'}`);
  console.log(`JPG detected: ${mimeJpg} (Expected: image/jpeg) -> ${mimeJpg === 'image/jpeg' ? '✅' : '❌'}`);
  console.log(`WEBP detected: ${mimeWebp} (Expected: image/webp) -> ${mimeWebp === 'image/webp' ? '✅' : '❌'}`);
  console.log(`Default detected: ${mimeDefault} (Expected: image/jpeg) -> ${mimeDefault === 'image/jpeg' ? '✅' : '❌'}`);

  // Test Confidence Clamping
  console.log('\n--- Unit Test: Confidence Clamping ---');
  console.log(`Clamped 94: ${aiService.clampConfidence(94)} (Expected: 94) -> ${aiService.clampConfidence(94) === 94 ? '✅' : '❌'}`);
  console.log(`Clamped -10: ${aiService.clampConfidence(-10)} (Expected: 0) -> ${aiService.clampConfidence(-10) === 0 ? '✅' : '❌'}`);
  console.log(`Clamped 150: ${aiService.clampConfidence(150)} (Expected: 100) -> ${aiService.clampConfidence(150) === 100 ? '✅' : '❌'}`);
  console.log(`Clamped 'foo': ${aiService.clampConfidence('foo')} (Expected: 0) -> ${aiService.clampConfidence('foo') === 0 ? '✅' : '❌'}`);

  // Mock Service Parsing / Fallback Unit Test
  console.log('\n--- Unit Test: Mock Service Parser & Fallbacks ---');
  const originalPost = axios.post;

  // Scenario A: Valid JSON output
  axios.post = async () => ({
    data: {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  food_name: 'Sate Ayam',
                  quantity: 1.5,
                  unit: 'Porsi',
                  estimated_serving_g: 150,
                  calories_kcal: 250,
                  protein_g: 22.4,
                  carbohydrate_g: 12.1,
                  fat_g: 8.5,
                  sugar_g: 4.2,
                  confidence: 95,
                  reasoning: 'Berdasarkan penampakan tusuk sate ayam dan bumbu kacang'
                })
              }
            ]
          }
        }
      ]
    }
  });

  // Temporarily configure dummy key for service test
  const envConfig = require('./src/config/env');
  const oldKey = envConfig.GEMINI_API_KEY;
  envConfig.GEMINI_API_KEY = 'test_key_for_service';

  try {
    const result = await aiService.predictFoodNutrition(TINY_PNG, 'sate ayam');
    console.log('Result A (Valid response):', result);
    if (result.food_name === 'Sate Ayam' && result.confidence === 95 && result.estimated_serving_g === 150) {
      console.log('✅ Scenario A Passed.');
    } else {
      console.error('❌ Scenario A Failed: Incorrect parsing');
    }
  } catch (err) {
    console.error('❌ Scenario A Failed with error:', err.message);
  }

  // Scenario B: Partial / Invalid JSON format (Testing Fallbacks)
  axios.post = async () => ({
    data: {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  food_name: '', // should fallback
                  quantity: -5,  // invalid, fallback to 1
                  unit: null,     // fallback to Porsi
                  estimated_serving_g: 'invalid', // fallback to 0
                  calories_kcal: -100, // fallback to 0
                  protein_g: 'invalid', // fallback to 0
                  carbohydrate_g: null, // fallback to 0
                  fat_g: 10,
                  sugar_g: 2,
                  confidence: 150, // clamp to 100
                  reasoning: null
                })
              }
            ]
          }
        }
      ]
    }
  });

  try {
    const result = await aiService.predictFoodNutrition(TINY_PNG);
    console.log('Result B (Invalid response with fallbacks):', result);
    const isValid = 
      result.food_name === 'Makanan Tidak Terdeteksi' &&
      result.quantity === 1 &&
      result.unit === 'Porsi' &&
      result.estimated_serving_g === 0 &&
      result.calories_kcal === 0 &&
      result.protein_g === 0 &&
      result.carbohydrate_g === 0 &&
      result.fat_g === 10 &&
      result.sugar_g === 2 &&
      result.confidence === 100 &&
      result.reasoning === '';
    
    if (isValid) {
      console.log('✅ Scenario B Passed (Fallbacks correctly applied).');
    } else {
      console.error('❌ Scenario B Failed: Fallbacks not correctly applied.');
    }
  } catch (err) {
    console.error('❌ Scenario B Failed with error:', err.message);
  }

  // Restore state
  envConfig.GEMINI_API_KEY = oldKey;
  axios.post = originalPost;
}

runTests();
