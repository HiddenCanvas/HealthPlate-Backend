const axios = require('axios');
const { supabaseAdmin } = require('./src/config/supabase');
require('dotenv').config();

const BASE_URL = 'http://localhost:3000/api/v1';

async function runTests() {
  try {
    console.log('--- SPRINT 4D.1 RECIPE BOLA SECURITY TESTING ---');

    // 1. Get a system recipe dynamically from Supabase
    console.log('Fetching a system recipe (user_id = NULL) from database...');
    const { data: systemRecipe, error: dbError } = await supabaseAdmin
      .from('recipes')
      .select('recipe_id, recipe_name')
      .is('user_id', null)
      .limit(1)
      .single();

    if (dbError || !systemRecipe) {
      console.error('FAILED to fetch system recipe:', dbError ? dbError.message : 'No system recipe found.');
      return;
    }
    console.log(`Found system recipe: "${systemRecipe.recipe_name}" (ID: ${systemRecipe.recipe_id})`);

    // 2. Register/Login a standard tester user
    let token = '';
    const userEmail = 'tester_sprint4d1_security@healthplate.com';
    try {
      const regRes = await axios.post(`${BASE_URL}/auth/register`, {
        name: 'BOLA Tester',
        email: userEmail,
        password: 'password123'
      });
      console.log('Register response:', regRes.data.message);
    } catch (err) {
      if (err.response && err.response.data) {
        console.log('Register status (expected if already exists):', err.response.data.message);
      } else {
        console.error('Register failed:', err.message);
      }
    }

    try {
      const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
        email: userEmail,
        password: 'password123'
      });
      token = loginRes.data.data.session.access_token;
      console.log('Logged in successfully. Auth token obtained.');
    } catch (err) {
      const errMsg = err.response && err.response.data ? err.response.data.message : err.message;
      console.error('Login failed:', errMsg);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    // ==========================================
    // CASE 1: Update system recipe
    // ==========================================
    console.log('\n[Case 1] Attempting to update system recipe...');
    try {
      await axios.put(`${BASE_URL}/recipe/${systemRecipe.recipe_id}`, {
        recipe_name: 'Hacked System Recipe'
      }, { headers });
      console.error('❌ Case 1 FAILED: Update request succeeded (Expected: 403 Forbidden).');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('✅ Case 1 PASSED: 403 Forbidden returned.');
        console.log('   Response Message:', err.response.data.message);
      } else {
        console.error('❌ Case 1 FAILED: Expected 403, got:', err.response ? err.response.status : err.message);
      }
    }

    // ==========================================
    // CASE 2: Delete system recipe
    // ==========================================
    console.log('\n[Case 2] Attempting to delete system recipe...');
    try {
      await axios.delete(`${BASE_URL}/recipe/${systemRecipe.recipe_id}`, { headers });
      console.error('❌ Case 2 FAILED: Delete request succeeded (Expected: 403 Forbidden).');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('✅ Case 2 PASSED: 403 Forbidden returned.');
        console.log('   Response Message:', err.response.data.message);
      } else {
        console.error('❌ Case 2 FAILED: Expected 403, got:', err.response ? err.response.status : err.message);
      }
    }

    // ==========================================
    // CASE 3: Upload image to system recipe
    // ==========================================
    console.log('\n[Case 3] Attempting to upload image to system recipe...');
    try {
      const formData = new FormData();
      const fileBlob = new Blob(['dummy image file content for system recipe'], { type: 'image/png' });
      formData.append('image', fileBlob, 'system_recipe_bola_test.png');

      await axios.post(`${BASE_URL}/upload/recipe/${systemRecipe.recipe_id}`, formData, {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data'
        }
      });
      console.error('❌ Case 3 FAILED: Image upload succeeded (Expected: 403 Forbidden).');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('✅ Case 3 PASSED: 403 Forbidden returned.');
        console.log('   Response Message:', err.response.data.message);
      } else {
        console.error('❌ Case 3 FAILED: Expected 403, got:', err.response ? err.response.status : err.message);
      }
    }

    // ==========================================
    // CASE 4: Update user's own recipe (Positive Test)
    // ==========================================
    console.log('\n[Case 4] Testing ownership on user-created recipe...');
    let myRecipeId = '';
    try {
      // Create own recipe
      const createRes = await axios.post(`${BASE_URL}/recipe`, {
        recipe_name: 'Tester Own Recipe',
        instructions: 'Mix water and oats.',
        cooking_time: 5,
        difficulty: 'Easy',
        servings: 1
      }, { headers });
      myRecipeId = createRes.data.data.recipe_id;
      console.log(`Created user recipe with ID: ${myRecipeId}`);

      // Try updating it
      const updateRes = await axios.put(`${BASE_URL}/recipe/${myRecipeId}`, {
        recipe_name: 'Tester Own Recipe Updated'
      }, { headers });

      if (updateRes.status === 200 && updateRes.data.data.recipe_name === 'Tester Own Recipe Updated') {
        console.log('✅ Case 4 PASSED: Successfully updated own recipe.');
      } else {
        console.error('❌ Case 4 FAILED: Unexpected response:', updateRes.data);
      }
    } catch (err) {
      console.error('❌ Case 4 FAILED: Request error:', err.response ? err.response.data : err.message);
    }

    // Clean up created recipe
    if (myRecipeId) {
      console.log('Cleaning up user created recipe...');
      try {
        await axios.delete(`${BASE_URL}/recipe/${myRecipeId}`, { headers });
        console.log('Cleanup successful.');
      } catch (err) {
        console.error('Failed to cleanup recipe:', err.message);
      }
    }

    // ==========================================
    // ADDITIONAL CASE 5: Add ingredient to system recipe
    // ==========================================
    console.log('\n[Case 5] Attempting to add ingredient to system recipe...');
    try {
      await axios.post(`${BASE_URL}/recipe/${systemRecipe.recipe_id}/ingredients`, {
        product_id: 'd0e15839-32fd-42ed-8526-d40b75f9c64a', // random uuid structure
        quantity: 100,
        unit: 'g'
      }, { headers });
      console.error('❌ Case 5 FAILED: Add ingredient succeeded (Expected: 403 Forbidden).');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('✅ Case 5 PASSED: 403 Forbidden returned.');
      } else {
        console.error('❌ Case 5 FAILED: Expected 403, got:', err.response ? err.response.status : err.message);
      }
    }

    // ==========================================
    // ADDITIONAL CASE 6: Add step to system recipe
    // ==========================================
    console.log('\n[Case 6] Attempting to add cooking step to system recipe...');
    try {
      await axios.post(`${BASE_URL}/recipe/${systemRecipe.recipe_id}/steps`, {
        step_number: 10,
        instruction: 'Hacked Step'
      }, { headers });
      console.error('❌ Case 6 FAILED: Add step succeeded (Expected: 403 Forbidden).');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('✅ Case 6 PASSED: 403 Forbidden returned.');
      } else {
        console.error('❌ Case 6 FAILED: Expected 403, got:', err.response ? err.response.status : err.message);
      }
    }

    console.log('\n--- ALL TEST CASES EXECUTED ---');

  } catch (globalError) {
    console.error('Unexpected global test runner error:', globalError);
  }
}

runTests();
