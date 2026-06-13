-- Verification Query: Check Meal Plan Module Data Integrity & Counts
-- File: verification_mealplan.sql

-- 1. Verifikasi Jumlah Total
SELECT 
  (SELECT COUNT(*) FROM focus_categories) AS total_focus_categories,
  (SELECT COUNT(*) FROM meal_packages) AS total_meal_packages,
  (SELECT COUNT(*) FROM recipes) AS total_recipes,
  (SELECT COUNT(*) FROM meal_package_items) AS total_meal_package_items;

-- 2. Verifikasi Distribusi Waktu Makan (Breakfast, Lunch, Dinner, Snack) per Paket
-- Setiap paket harus memiliki tepat 4 item dengan masing-masing meal_time unik
SELECT 
  mp.package_name,
  COUNT(mpi.package_item_id) AS total_mapped_meals,
  COUNT(CASE WHEN mpi.meal_time = 'Breakfast' THEN 1 END) AS breakfast_count,
  COUNT(CASE WHEN mpi.meal_time = 'Lunch' THEN 1 END) AS lunch_count,
  COUNT(CASE WHEN mpi.meal_time = 'Dinner' THEN 1 END) AS dinner_count,
  COUNT(CASE WHEN mpi.meal_time = 'Snack' THEN 1 END) AS snack_count
FROM meal_packages mp
LEFT JOIN meal_package_items mpi ON mp.package_id = mpi.package_id
GROUP BY mp.package_name
ORDER BY mp.package_name;

-- 3. Verifikasi Nama Resep dan Nilai Kalori per Paket (Sampel Detail)
SELECT 
  mp.package_name,
  fc.focus_name,
  mpi.meal_time,
  r.recipe_name,
  r.calories_kcal
FROM meal_packages mp
JOIN focus_categories fc ON mp.focus_id = fc.focus_id
JOIN meal_package_items mpi ON mp.package_id = mpi.package_id
JOIN recipes r ON mpi.recipe_id = r.recipe_id
ORDER BY fc.focus_name, mp.package_name, 
  CASE mpi.meal_time 
    WHEN 'Breakfast' THEN 1 
    WHEN 'Lunch' THEN 2 
    WHEN 'Dinner' THEN 3 
    WHEN 'Snack' THEN 4 
  END;
