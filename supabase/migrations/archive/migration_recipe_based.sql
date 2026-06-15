-- Migrasi Arsitektur Meal Plan: Product-Based → Recipe-Based
-- File: migration_recipe_based.sql

-- 1. Buat tabel meal_categories
CREATE TABLE IF NOT EXISTS meal_categories (
  category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name VARCHAR(50) NOT NULL UNIQUE
);

-- Insert kategori dasar
INSERT INTO meal_categories (category_name) VALUES
  ('Breakfast'), ('Lunch'), ('Dinner'), ('Snack')
ON CONFLICT DO NOTHING;

-- 2. Buat tabel meal_packages (misal: "Paket Diet Sehat", "Paket Bulking", dll)
CREATE TABLE IF NOT EXISTS meal_packages (
  package_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id  UUID NOT NULL REFERENCES meal_categories(category_id) ON DELETE CASCADE,
  package_name VARCHAR(255) NOT NULL,
  description  TEXT
);

-- 3. Update tabel recipes
ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS package_id     UUID REFERENCES meal_packages(package_id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cooking_time   INTEGER,
  ADD COLUMN IF NOT EXISTS difficulty     VARCHAR(20) CHECK (difficulty IN ('Easy','Medium','Hard')),
  ADD COLUMN IF NOT EXISTS servings       INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS calories_kcal  DECIMAL(8,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS protein_g      DECIMAL(8,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS carbohydrate_g DECIMAL(8,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fat_g          DECIMAL(8,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sugar_g        DECIMAL(8,2) DEFAULT 0;

-- Ubah user_id menjadi nullable agar kita bisa menyimpan resep sistem/bawaan (user_id IS NULL)
ALTER TABLE recipes ALTER COLUMN user_id DROP NOT NULL;

-- 4. Buat tabel recipe_steps
CREATE TABLE IF NOT EXISTS recipe_steps (
  step_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id   UUID NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  UNIQUE(recipe_id, step_number)
);

-- 5. Hapus referensi product_id di meal_plan_items dan ganti ke recipe_id
-- PERINGATAN: Menghapus row yang tidak memiliki meal_date (format lama)
DELETE FROM meal_plan_items WHERE meal_date IS NULL;

ALTER TABLE meal_plan_items DROP COLUMN IF EXISTS product_id;
ALTER TABLE meal_plan_items ADD COLUMN IF NOT EXISTS recipe_id UUID REFERENCES recipes(recipe_id) ON DELETE SET NULL;

-- 6. Setup Row Level Security & Policies
-- recipe_steps
ALTER TABLE recipe_steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "recipe_steps_select" ON recipe_steps;
CREATE POLICY "recipe_steps_select" ON recipe_steps FOR SELECT USING (true);

DROP POLICY IF EXISTS "recipe_steps_modify" ON recipe_steps;
CREATE POLICY "recipe_steps_modify" ON recipe_steps FOR ALL USING (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.recipe_id = recipe_steps.recipe_id
          AND (recipes.user_id = auth.uid() OR recipes.user_id IS NULL))
);

-- meal_categories & meal_packages
ALTER TABLE meal_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "meal_categories_select" ON meal_categories;
CREATE POLICY "meal_categories_select" ON meal_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "meal_packages_select" ON meal_packages;
CREATE POLICY "meal_packages_select" ON meal_packages FOR SELECT USING (true);

-- Perbarui policy recipes_insert_own agar bisa insert dengan user_id NULL
DROP POLICY IF EXISTS "recipes_insert_own" ON recipes;
CREATE POLICY "recipes_insert_own" ON recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 7. Tambahkan Index untuk optimasi
CREATE INDEX IF NOT EXISTS idx_recipe_steps_recipe ON recipe_steps(recipe_id, step_number);
CREATE INDEX IF NOT EXISTS idx_meal_plan_items_recipe ON meal_plan_items(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipes_package ON recipes(package_id);

-- Selesai.
