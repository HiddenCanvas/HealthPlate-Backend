-- ==============================================================================
-- Seeder Resep Bawaan HealthPlate (Recipe-Based Meal Plan)
-- ==============================================================================

-- Pastikan ada food category
INSERT INTO food_category (name) VALUES 
('Sumber Karbohidrat'),
('Sumber Protein Hewani'),
('Sumber Protein Nabati'),
('Sayuran'),
('Buah-buahan'),
('Produk Susu & Olahannya'),
('Lainnya')
ON CONFLICT DO NOTHING;

-- Siapkan beberapa bahan dasar (Food Products) jika belum ada
-- Asumsi kita tidak tahu UUID pastinya, kita gunakan DO UPDATE untuk update nilai
INSERT INTO food_products (product_name, category_id, serving_size_g, calories_kcal, protein_g, carbohydrate_g, fat_g, sugar_g)
SELECT 'Telur Ayam', category_id, 100, 155, 12.6, 1.1, 10.6, 1.1 FROM food_category WHERE name = 'Sumber Protein Hewani' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO food_products (product_name, category_id, serving_size_g, calories_kcal, protein_g, carbohydrate_g, fat_g, sugar_g)
SELECT 'Beras Putih', category_id, 100, 130, 2.7, 28, 0.3, 0.1 FROM food_category WHERE name = 'Sumber Karbohidrat' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO food_products (product_name, category_id, serving_size_g, calories_kcal, protein_g, carbohydrate_g, fat_g, sugar_g)
SELECT 'Dada Ayam', category_id, 100, 165, 31, 0, 3.6, 0 FROM food_category WHERE name = 'Sumber Protein Hewani' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO food_products (product_name, category_id, serving_size_g, calories_kcal, protein_g, carbohydrate_g, fat_g, sugar_g)
SELECT 'Bayam', category_id, 100, 23, 2.9, 3.6, 0.4, 0.4 FROM food_category WHERE name = 'Sayuran' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO food_products (product_name, category_id, serving_size_g, calories_kcal, protein_g, carbohydrate_g, fat_g, sugar_g)
SELECT 'Pisang', category_id, 100, 89, 1.1, 22.8, 0.3, 12.2 FROM food_category WHERE name = 'Buah-buahan' LIMIT 1
ON CONFLICT DO NOTHING;

-- Catatan: Karena kita tidak punya akses langsung ke ID hasil insert di environment ini dengan cara mudah (selain plpgsql DO block besar), 
-- kita akan menggunakan DO block untuk eksekusi seed data secara transaksional.

DO $$
DECLARE
    cat_breakfast UUID;
    cat_lunch UUID;
    cat_dinner UUID;
    cat_snack UUID;
    
    pkg_indo_sehat UUID;
    
    id_telur UUID;
    id_beras UUID;
    id_ayam UUID;
    id_bayam UUID;
    id_pisang UUID;
    
    recipe1 UUID;
    recipe2 UUID;
    recipe3 UUID;
    recipe4 UUID;
BEGIN
    -- Ambil Category IDs
    SELECT category_id INTO cat_breakfast FROM meal_categories WHERE category_name = 'Breakfast';
    SELECT category_id INTO cat_lunch FROM meal_categories WHERE category_name = 'Lunch';
    SELECT category_id INTO cat_dinner FROM meal_categories WHERE category_name = 'Dinner';
    SELECT category_id INTO cat_snack FROM meal_categories WHERE category_name = 'Snack';

    -- Buat Package
    INSERT INTO meal_packages (category_id, package_name, description)
    VALUES (cat_lunch, 'Diet Nusantara Sehat', 'Menu makanan rumahan Indonesia yang rendah kalori')
    RETURNING package_id INTO pkg_indo_sehat;

    -- Ambil Product IDs
    SELECT product_id INTO id_telur FROM food_products WHERE product_name = 'Telur Ayam' LIMIT 1;
    SELECT product_id INTO id_beras FROM food_products WHERE product_name = 'Beras Putih' LIMIT 1;
    SELECT product_id INTO id_ayam FROM food_products WHERE product_name = 'Dada Ayam' LIMIT 1;
    SELECT product_id INTO id_bayam FROM food_products WHERE product_name = 'Bayam' LIMIT 1;
    SELECT product_id INTO id_pisang FROM food_products WHERE product_name = 'Pisang' LIMIT 1;

    -- ---------------------------------------------------------
    -- RESEP 1: Telur Rebus (Breakfast)
    -- ---------------------------------------------------------
    INSERT INTO recipes (user_id, recipe_name, description, instructions, cooking_time, difficulty, servings, calories_kcal, protein_g, carbohydrate_g, fat_g)
    VALUES (NULL, 'Telur Rebus Sederhana', 'Sarapan praktis tinggi protein', 'Rebus air hingga mendidih. Masukkan telur. Rebus selama 7-10 menit. Angkat dan kupas.', 10, 'Easy', 1, 155, 12.6, 1.1, 10.6)
    RETURNING recipe_id INTO recipe1;

    INSERT INTO bahan_resep (recipe_id, product_id, quantity, unit) VALUES (recipe1, id_telur, 100, 'gram');

    INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES 
    (recipe1, 1, 'Didihkan air dalam panci kecil.'),
    (recipe1, 2, 'Masukkan telur perlahan, masak selama 7-10 menit sesuai tingkat kematangan yang diinginkan.'),
    (recipe1, 3, 'Angkat telur, rendam dalam air dingin sebentar, lalu kupas cangkangnya.');

    -- ---------------------------------------------------------
    -- RESEP 2: Nasi Dada Ayam Panggang (Lunch)
    -- ---------------------------------------------------------
    INSERT INTO recipes (user_id, package_id, recipe_name, description, instructions, cooking_time, difficulty, servings, calories_kcal, protein_g, carbohydrate_g, fat_g)
    VALUES (NULL, pkg_indo_sehat, 'Nasi Dada Ayam Panggang', 'Makan siang padat gizi, cocok untuk bulking/diet', 'Panggang dada ayam. Sajikan dengan nasi putih.', 30, 'Medium', 1, 460, 33.7, 28, 3.9)
    RETURNING recipe_id INTO recipe2;

    INSERT INTO bahan_resep (recipe_id, product_id, quantity, unit) VALUES 
    (recipe2, id_ayam, 100, 'gram'),
    (recipe2, id_beras, 200, 'gram');

    INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES 
    (recipe2, 1, 'Marinasi dada ayam dengan sedikit garam dan merica selama 10 menit.'),
    (recipe2, 2, 'Panggang dada ayam di teflon anti lengket hingga matang sempurna (sekitar 15 menit).'),
    (recipe2, 3, 'Sajikan bersama dengan 200g nasi putih hangat.');

    -- ---------------------------------------------------------
    -- RESEP 3: Sayur Bening Bayam (Dinner)
    -- ---------------------------------------------------------
    INSERT INTO recipes (user_id, package_id, recipe_name, description, instructions, cooking_time, difficulty, servings, calories_kcal, protein_g, carbohydrate_g, fat_g)
    VALUES (NULL, pkg_indo_sehat, 'Sayur Bening Bayam', 'Makan malam ringan berserat', 'Rebus bayam dengan bumbu iris.', 15, 'Easy', 1, 46, 5.8, 7.2, 0.8)
    RETURNING recipe_id INTO recipe3;

    INSERT INTO bahan_resep (recipe_id, product_id, quantity, unit) VALUES (recipe3, id_bayam, 200, 'gram');

    INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES 
    (recipe3, 1, 'Didihkan air, masukkan irisan bawang merah dan temu kunci (opsional).'),
    (recipe3, 2, 'Masukkan daun bayam yang sudah dicuci bersih.'),
    (recipe3, 3, 'Tambahkan sejumput garam, masak sebentar jangan sampai terlalu layu (sekitar 2-3 menit).');

    -- ---------------------------------------------------------
    -- RESEP 4: Pisang (Snack)
    -- ---------------------------------------------------------
    INSERT INTO recipes (user_id, recipe_name, description, instructions, cooking_time, difficulty, servings, calories_kcal, protein_g, carbohydrate_g, fat_g)
    VALUES (NULL, 'Pisang Segar', 'Cemilan buah alami penambah energi', 'Kupas pisang dan makan langsung.', 0, 'Easy', 1, 133.5, 1.65, 34.2, 0.45)
    RETURNING recipe_id INTO recipe4;

    INSERT INTO bahan_resep (recipe_id, product_id, quantity, unit) VALUES (recipe4, id_pisang, 150, 'gram');

    INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES 
    (recipe4, 1, 'Pilih pisang yang tingkat kematangannya pas.'),
    (recipe4, 2, 'Kupas kulit pisang dan siap dinikmati.');

END $$;
