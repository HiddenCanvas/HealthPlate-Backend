-- Migration Reset: Clear and Reset Meal Plan Module Data
-- File: migration_reset_mealplan.sql

BEGIN;

-- 1. Hapus data dari tabel transaksi meal plan harian user
DELETE FROM "meal_plan_items";
DELETE FROM "meal_plans";

-- 2. Hapus data dari tabel relasi paket dan resep
DELETE FROM "meal_package_items";

-- 3. Hapus data dari tabel pendukung resep
DELETE FROM "recipe_steps";
DELETE FROM "bahan_resep";

-- 4. Hapus data dari tabel utama resep
DELETE FROM "recipes";

-- 5. Hapus data dari tabel paket meal plan
DELETE FROM "meal_packages";

-- 6. Hapus data dari tabel fokus nutrisi
DELETE FROM "focus_categories";

COMMIT;
