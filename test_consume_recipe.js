const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function runTests() {
  try {
    console.log('--- SPRINT 3A CONSUME RECIPE TESTING ---');

    // 1. Try registering a test user
    let token = '';
    try {
      const regRes = await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Sprint 3A Tester',
        email: 'tester_sprint3a@healthplate.com',
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
        email: 'tester_sprint3a@healthplate.com',
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

    // 3. Get a valid recipe ID
    console.log('\nFetching a valid recipe from database...');
    let recipeId = '';
    let recipeName = '';
    try {
      const recipeRes = await axios.get(`${BASE_URL}/recipe`, { headers });
      if (recipeRes.data && recipeRes.data.data && recipeRes.data.data.length > 0) {
        const recipesWithIngredients = recipeRes.data.data.filter(r => r.ingredients && r.ingredients.length > 0);
        if (recipesWithIngredients.length > 0) {
          recipeId = recipesWithIngredients[0].recipe_id;
          recipeName = recipesWithIngredients[0].recipe_name;
        } else {
          recipeId = recipeRes.data.data[0].recipe_id;
          recipeName = recipeRes.data.data[0].recipe_name;
        }
        console.log(`Found recipe: "${recipeName}" with ID: ${recipeId}`);
      } else {
        console.error('No recipes found in the database. Make sure seeder was run.');
        return;
      }
    } catch (err) {
      const errMsg = err.response && err.response.data ? err.response.data.message : err.message;
      console.error('Failed to fetch recipes:', errMsg);
      return;
    }

    const testDate = '2026-06-16';

    // 4. Test Case 1: Recipe valid
    console.log(`\n[Test Case 1] Consuming recipe "${recipeName}" on ${testDate}...`);
    try {
      const res = await axios.post(`${BASE_URL}/log/${testDate}/consume-recipe`, {
        recipe_id: recipeId,
        meal_time: 'Breakfast',
        portion_multiplier: 1.5,
        source: 'meal_plan'
      }, { headers });

      console.log('Status:', res.status, '(Expected: 201)');
      console.log('Response body:', res.data);
      
      if (res.status === 201 && res.data.success) {
        console.log('SUCCESS: Recipe consumed and entries inserted.');
      } else {
        console.error('FAILED: Invalid status or success flag.');
      }

      // Check daily log to verify update
      console.log(`\nVerifying daily log on ${testDate} via GET...`);
      const logRes = await axios.get(`${BASE_URL}/log/${testDate}`, { headers });
      console.log('Daily Log Status:', logRes.status);
      console.log('Daily Log Totals:', {
        total_calories: logRes.data.data.total_calories,
        total_protein: logRes.data.data.total_protein,
        total_carbs: logRes.data.data.total_carbs,
        total_fat: logRes.data.data.total_fat,
        total_sugar: logRes.data.data.total_sugar,
      });
      console.log('Log entries count:', logRes.data.data.log_entries.length);
      console.log('Last log entry metadata:', {
        recipe_id: logRes.data.data.log_entries[0].recipe_id,
        source: logRes.data.data.log_entries[0].source
      });
    } catch (err) {
      console.error('FAILED Test Case 1:', err.response ? err.response.data : err.message);
    }

    // 5. Test Case 2: Recipe not found (404)
    const fakeRecipeId = '00000000-0000-0000-0000-000000000000';
    console.log(`\n[Test Case 2] Consuming non-existent recipe ID: ${fakeRecipeId}...`);
    try {
      await axios.post(`${BASE_URL}/log/${testDate}/consume-recipe`, {
        recipe_id: fakeRecipeId,
        meal_time: 'Breakfast',
        portion_multiplier: 1
      }, { headers });
      console.error('FAILED: Expected 404, but request succeeded.');
    } catch (err) {
      if (err.response) {
        console.log('Status:', err.response.status, '(Expected: 404)');
        console.log('Response body:', err.response.data);
      } else {
        console.error('FAILED: Request failed without response:', err.message);
      }
    }

    // 6. Test Case 3: Meal time invalid (400)
    console.log('\n[Test Case 3] Consuming with invalid meal_time ("MidnightSnack")...');
    try {
      await axios.post(`${BASE_URL}/log/${testDate}/consume-recipe`, {
        recipe_id: recipeId,
        meal_time: 'MidnightSnack',
        portion_multiplier: 1
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

    // 7. Test Case 4: Portion multiplier invalid (400)
    console.log('\n[Test Case 4] Consuming with negative portion_multiplier (-0.5)...');
    try {
      await axios.post(`${BASE_URL}/log/${testDate}/consume-recipe`, {
        recipe_id: recipeId,
        meal_time: 'Breakfast',
        portion_multiplier: -0.5
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

    // 8. Test Case 5: Invalid source metadata (400)
    console.log('\n[Test Case 5] Consuming with invalid source ("hack")...');
    try {
      await axios.post(`${BASE_URL}/log/${testDate}/consume-recipe`, {
        recipe_id: recipeId,
        meal_time: 'Breakfast',
        portion_multiplier: 1,
        source: 'hack'
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

  } catch (err) {
    console.error('Unexpected testing error:', err.message);
  }
}

runTests();
