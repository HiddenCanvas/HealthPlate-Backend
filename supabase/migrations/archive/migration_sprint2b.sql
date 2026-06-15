-- Migration Plan Sprint 2B: Safe Clean Break Database Foundation
-- File: migration_sprint2b.sql

-- 1. Pembuatan Tabel Baru: focus_categories
CREATE TABLE IF NOT EXISTS "focus_categories" (
    "focus_id"   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "focus_name" VARCHAR(100) UNIQUE NOT NULL,
    "description" TEXT NULL,
    "created_at"  TIMESTAMPTZ DEFAULT now()
);

-- 2. Pembuatan Tabel Baru: meal_package_items (Junction Table Many-to-Many)
CREATE TABLE IF NOT EXISTS "meal_package_items" (
    "package_item_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "package_id"      UUID NOT NULL REFERENCES "meal_packages"("package_id") ON DELETE CASCADE,
    "recipe_id"       UUID NOT NULL REFERENCES "recipes"("recipe_id") ON DELETE CASCADE,
    "meal_time"       VARCHAR(20) NOT NULL CHECK (meal_time IN ('Breakfast', 'Lunch', 'Dinner', 'Snack')),
    CONSTRAINT uq_package_recipe_time UNIQUE (package_id, recipe_id, meal_time)
);

-- 3. Modifikasi Tabel meal_packages (Menambah focus_id dan metadata paket baru)
ALTER TABLE "meal_packages" 
ADD COLUMN IF NOT EXISTS "focus_id" UUID REFERENCES "focus_categories"("focus_id") ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS "estimated_calories" DECIMAL(8,2) NULL,
ADD COLUMN IF NOT EXISTS "image_url" TEXT NULL,
ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ DEFAULT now();

-- 4. Enable RLS & Policies
ALTER TABLE "focus_categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "meal_package_items" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "focus_categories_select" ON "focus_categories";
CREATE POLICY "focus_categories_select" ON "focus_categories" FOR SELECT USING (true);

DROP POLICY IF EXISTS "meal_package_items_select" ON "meal_package_items";
CREATE POLICY "meal_package_items_select" ON "meal_package_items" FOR SELECT USING (true);

-- 5. Buat Index
CREATE INDEX IF NOT EXISTS idx_meal_package_items_package ON meal_package_items(package_id);
CREATE INDEX IF NOT EXISTS idx_meal_package_items_recipe ON meal_package_items(recipe_id);
CREATE INDEX IF NOT EXISTS idx_meal_packages_focus ON meal_packages(focus_id);
