-- ==============================================================================
-- SQL Verification Queries for Sprint 3B — Dashboard & History
-- ==============================================================================

-- 1. Verifikasi Ringkasan Gizi Harian (GET /summary/:date)
SELECT 
    log_date,
    total_calories AS calories,
    total_protein AS protein,
    total_carbs AS carbohydrate,
    total_fat AS fat,
    total_sugar AS sugar
FROM daily_logs
WHERE user_id = (SELECT user_id FROM users WHERE email = 'tester_sprint3b@healthplate.com' LIMIT 1)
  AND log_date = CURRENT_DATE;

-- 2. Verifikasi Riwayat Konsumsi Lengkap (GET /log/history)
SELECT 
    dl.log_date,
    le.meal_time,
    le.source,
    r.recipe_name,
    fp.product_name,
    le.consumed_calories,
    le.consumed_protein,
    le.consumed_carbs AS consumed_carbohydrate,
    le.consumed_fat,
    le.consumed_sugar
FROM log_entries le
JOIN daily_logs dl ON dl.log_id = le.log_id
LEFT JOIN recipes r ON r.recipe_id = le.recipe_id
LEFT JOIN food_products fp ON fp.product_id = le.product_id
WHERE dl.user_id = (SELECT user_id FROM users WHERE email = 'tester_sprint3b@healthplate.com' LIMIT 1)
ORDER BY le.created_at DESC;

-- 3. Verifikasi Rata-Rata Gizi 7 Hari & 30 Hari (GET /dashboard/nutrition)
SELECT 
    COUNT(*) AS total_logged_days,
    ROUND(AVG(total_calories), 2) AS avg_calories,
    ROUND(AVG(total_protein), 2) AS avg_protein,
    ROUND(AVG(total_carbs), 2) AS avg_carbohydrate,
    ROUND(AVG(total_fat), 2) AS avg_fat,
    ROUND(AVG(total_sugar), 2) AS avg_sugar
FROM daily_logs
WHERE user_id = (SELECT user_id FROM users WHERE email = 'tester_sprint3b@healthplate.com' LIMIT 1)
  AND log_date >= CURRENT_DATE - INTERVAL '30 days';

-- 4. Verifikasi Resep Terpopuler (GET /dashboard/top-recipes)
SELECT 
    le.recipe_id,
    r.recipe_name,
    COUNT(*) AS consumption_count,
    MAX(le.created_at) AS last_consumed_at
FROM log_entries le
JOIN daily_logs dl ON dl.log_id = le.log_id
JOIN recipes r ON r.recipe_id = le.recipe_id
WHERE dl.user_id = (SELECT user_id FROM users WHERE email = 'tester_sprint3b@healthplate.com' LIMIT 1)
GROUP BY le.recipe_id, r.recipe_name
ORDER BY consumption_count DESC;
