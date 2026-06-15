const { supabaseAdmin } = require('../src/config/supabase');
const dashboardService = require('../src/services/dashboard.service');
const logService = require('../src/services/log.service');

async function testServices() {
  try {
    // 1. Find the user ID for the most recent log entries
    const { data: entries } = await supabaseAdmin
      .from('log_entries')
      .select('entry_id, source, custom_name, log_id, daily_logs(user_id, log_date)')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!entries || entries.length === 0) {
      console.log('No log entries found.');
      return;
    }

    console.log('Sample entries and user IDs:');
    for (const e of entries) {
      const userId = e.daily_logs?.user_id;
      const logDate = e.daily_logs?.log_date;
      console.log(`Entry ID: ${e.entry_id}, Source: ${e.source}, Custom Name: ${e.custom_name}, User ID: ${userId}, Date: ${logDate}`);
    }

    // Pick the user and date of the ai_prediction entry
    const aiEntry = entries.find(e => e.source === 'ai_prediction');
    if (!aiEntry) {
      console.log('No ai_prediction entry found in the sample.');
      return;
    }

    const userId = aiEntry.daily_logs.user_id;
    const logDate = aiEntry.daily_logs.log_date;

    console.log(`\nTesting getLogByDate for User ID ${userId} on date ${logDate}...`);
    const logDetails = await logService.getLogByDate(userId, logDate);
    console.log('Log Details entries:');
    logDetails.log_entries.forEach(e => {
      console.log(`- ID: ${e.entry_id}, Source: ${e.source}, Name: ${e.custom_name || e.food_products?.product_name || 'Unnamed'}, Calories: ${e.consumed_calories}`);
    });

    console.log(`\nTesting getSummary (Dashboard) for User ID ${userId} (today summary)...`);
    // Note: getSummary uses today's date, let's see if the entry matches today.
    // If not, we can temporarily mock or check the returned entries.
    const summary = await dashboardService.getSummary(userId);
    console.log('Dashboard summary date:', summary.date);
    console.log('Dashboard summary consumed:', summary.consumed);
    console.log('Dashboard summary entries:');
    summary.entries.forEach(e => {
      console.log(`- ID: ${e.entry_id}, Source: ${e.source}, Name: ${e.custom_name || e.food_products?.product_name || 'Unnamed'}, Calories: ${e.consumed_calories}`);
    });

  } catch (err) {
    console.error('Error testing services:', err);
  }
}

testServices();
