-- ============================================================
-- HealthPlate: Master Database Schema & RLS Policies
-- Gabungan seluruh query (Awal s.d. Update Terbaru 2026)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- STEP 1: Pembuatan Tabel (Urutan Berdasarkan Dependensi)
-- ────────────────────────────────────────────────────────────

-- 1. Food Category
CREATE TABLE IF NOT EXISTS "food_category" (
    "category_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name"        VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at"  TIMESTAMPTZ DEFAULT now(),
    "updated_at"  TIMESTAMPTZ DEFAULT now()
);

-- 1b. Meal Category
CREATE TABLE IF NOT EXISTS "meal_categories" (
    "category_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "category_name" VARCHAR(50) NOT NULL UNIQUE
);

-- 1c. Meal Packages
CREATE TABLE IF NOT EXISTS "meal_packages" (
    "package_id"   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "category_id"  UUID NOT NULL REFERENCES "meal_categories"("category_id") ON DELETE CASCADE,
    "package_name" VARCHAR(255) NOT NULL,
    "description"  TEXT
);

-- 2. Food Products
CREATE TABLE IF NOT EXISTS "food_products" (
    "product_id"     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "category_id"    UUID REFERENCES "food_category"("category_id") ON DELETE SET NULL,
    "barcode_code"   VARCHAR(255) UNIQUE,
    "product_name"   VARCHAR(255) NOT NULL,
    "brand_name"     VARCHAR(255),
    "serving_size_g" DECIMAL(8, 2) NOT NULL DEFAULT 100,
    "calories_kcal"  DECIMAL(8, 2) NOT NULL DEFAULT 0,
    "sugar_g"        DECIMAL(8, 2) NOT NULL DEFAULT 0,
    "carbohydrate_g" DECIMAL(8, 2) NOT NULL DEFAULT 0,
    "protein_g"      DECIMAL(8, 2) NOT NULL DEFAULT 0,
    "fat_g"          DECIMAL(8, 2) NOT NULL DEFAULT 0,
    "sodium_mg"      DECIMAL(8, 2),
    "image_url"      TEXT, -- Ditambahkan dari update log terbaru
    "created_at"     TIMESTAMPTZ DEFAULT now(),
    "updated_at"     TIMESTAMPTZ DEFAULT now()
);

-- 3. Users (Terintegrasi dengan Supabase Auth)
CREATE TABLE IF NOT EXISTS "users" (
    "user_id"        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    "name"           VARCHAR(255) NOT NULL,
    "email"          VARCHAR(255) UNIQUE NOT NULL,
    "role"           VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')), -- Fitur Admin Panel
    "gender"         VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    "birth_date"     DATE,
    "weight_kg"      DECIMAL(5, 2) CHECK (weight_kg > 0),
    "height_cm"      DECIMAL(5, 2) CHECK (height_cm > 0),
    "calories_kcal"  DECIMAL(8, 2) CHECK (calories_kcal >= 0),
    "sugar_g"        DECIMAL(8, 2) CHECK (sugar_g >= 0),
    "carbohydrate_g" DECIMAL(8, 2) CHECK (carbohydrate_g >= 0),
    "protein_g"      DECIMAL(8, 2) CHECK (protein_g >= 0),
    "fat_g"          DECIMAL(8, 2) CHECK (fat_g >= 0),
    "fcm_token"      TEXT, -- Ditambahkan untuk Push Notification
    "avatar_url"     TEXT, -- Ditambahkan untuk foto profil
    "created_at"     TIMESTAMPTZ DEFAULT now()
);

-- 4. Daily Logs
CREATE TABLE IF NOT EXISTS "daily_logs" (
    "log_id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id"        UUID NOT NULL REFERENCES "users"("user_id") ON DELETE CASCADE,
    "log_date"       DATE NOT NULL,
    "total_calories" DECIMAL(8, 2) NOT NULL DEFAULT 0,
    "total_sugar"    DECIMAL(8, 2) NOT NULL DEFAULT 0,
    "total_carbs"    DECIMAL(8, 2) NOT NULL DEFAULT 0,
    "total_protein"  DECIMAL(8, 2) NOT NULL DEFAULT 0,
    "total_fat"      DECIMAL(8, 2) NOT NULL DEFAULT 0,
    "total_water_ml" DECIMAL(8, 2) NOT NULL DEFAULT 0,
    UNIQUE("user_id", "log_date")
);

-- 5. Log Entries
CREATE TABLE IF NOT EXISTS "log_entries" (
    "entry_id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "log_id"            UUID NOT NULL REFERENCES "daily_logs"("log_id") ON DELETE CASCADE,
    "product_id"        UUID REFERENCES "food_products"("product_id") ON DELETE SET NULL,
    "custom_name"       VARCHAR(255),
    "meal_time"         VARCHAR(20) NOT NULL CHECK (meal_time IN ('Breakfast', 'Lunch', 'Dinner', 'Snack')),
    "portion"           DECIMAL(8, 2) NOT NULL CHECK (portion > 0),
    "consumed_calories" DECIMAL(8, 2) NOT NULL DEFAULT 0,
    "consumed_sugar"    DECIMAL(8, 2) NOT NULL DEFAULT 0,
    "consumed_carbs"    DECIMAL(8, 2) NOT NULL DEFAULT 0,
    "consumed_protein"  DECIMAL(8, 2) NOT NULL DEFAULT 0,
    "consumed_fat"      DECIMAL(8, 2) NOT NULL DEFAULT 0,
    "image_url"         TEXT,
    "created_at"        TIMESTAMPTZ DEFAULT now()
);

-- 6. Recipes
CREATE TABLE IF NOT EXISTS "recipes" (
    "recipe_id"      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id"        UUID REFERENCES "users"("user_id") ON DELETE CASCADE, -- Nullable untuk resep sistem
    "package_id"     UUID REFERENCES "meal_packages"("package_id") ON DELETE SET NULL,
    "recipe_name"    VARCHAR(255) NOT NULL,
    "description"    TEXT,
    "instructions"   TEXT NOT NULL,
    "image_url"      TEXT, -- Ditambahkan dari update gambar resep
    "cooking_time"   INTEGER,
    "difficulty"     VARCHAR(20) CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    "servings"       INTEGER DEFAULT 1,
    "calories_kcal"  DECIMAL(8, 2) DEFAULT 0,
    "protein_g"      DECIMAL(8, 2) DEFAULT 0,
    "carbohydrate_g" DECIMAL(8, 2) DEFAULT 0,
    "fat_g"          DECIMAL(8, 2) DEFAULT 0,
    "sugar_g"        DECIMAL(8, 2) DEFAULT 0,
    "created_at"     TIMESTAMPTZ DEFAULT now(),
    "updated_at"     TIMESTAMPTZ DEFAULT now()
);

-- 7. Recipe Steps
CREATE TABLE IF NOT EXISTS "recipe_steps" (
    "step_id"     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "recipe_id"   UUID NOT NULL REFERENCES "recipes"("recipe_id") ON DELETE CASCADE,
    "step_number" INTEGER NOT NULL,
    "instruction" TEXT NOT NULL,
    UNIQUE("recipe_id", "step_number")
);

-- 8. Bahan Resep
CREATE TABLE IF NOT EXISTS "bahan_resep" (
    "bahan_id"   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "recipe_id"  UUID NOT NULL REFERENCES "recipes"("recipe_id") ON DELETE CASCADE,
    "product_id" UUID REFERENCES "food_products"("product_id") ON DELETE SET NULL,
    "quantity"   DECIMAL(8, 2) NOT NULL CHECK (quantity > 0),
    "unit"       VARCHAR(50) NOT NULL
);

-- 9. Meal Plans
CREATE TABLE IF NOT EXISTS "meal_plans" (
    "plan_id"      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id"      UUID NOT NULL REFERENCES "users"("user_id") ON DELETE CASCADE,
    "plan_name"    VARCHAR(255) NOT NULL,
    "status"       VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Active', 'Inactive', 'Draft')),
    "activated_at" DATE, -- Ditambahkan dari update metadata aktivasi
    "expires_at"   DATE, -- Ditambahkan dari update metadata aktivasi
    "created_at"   TIMESTAMPTZ DEFAULT now(),
    "updated_at"   TIMESTAMPTZ DEFAULT now()
);

-- 10. Meal Plan Items
CREATE TABLE IF NOT EXISTS "meal_plan_items" (
    "item_id"    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "plan_id"    UUID NOT NULL REFERENCES "meal_plans"("plan_id") ON DELETE CASCADE,
    "recipe_id"  UUID REFERENCES "recipes"("recipe_id") ON DELETE SET NULL,
    "meal_day"   VARCHAR(10) NOT NULL CHECK (meal_day IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
    "meal_time"  VARCHAR(20) NOT NULL CHECK (meal_time IN ('Breakfast', 'Lunch', 'Dinner', 'Snack')),
    "portion"    DECIMAL(8, 2) NOT NULL CHECK (portion > 0),
    "meal_date"  DATE -- Ditambahkan dari update terbaru untuk query harian
);

-- 10. User Bookmarks
CREATE TABLE IF NOT EXISTS "user_bookmarks" (
    "bookmark_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id"     UUID NOT NULL REFERENCES "users"("user_id") ON DELETE CASCADE,
    "product_id"  UUID REFERENCES "food_products"("product_id") ON DELETE CASCADE,
    "recipe_id"   UUID REFERENCES "recipes"("recipe_id") ON DELETE CASCADE,
    "created_at"  TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT bookmark_target_check CHECK (
        (product_id IS NOT NULL AND recipe_id IS NULL) OR
        (product_id IS NULL AND recipe_id IS NOT NULL)
    ),
    UNIQUE("user_id", "product_id"),
    UNIQUE("user_id", "recipe_id")
);

-- 11. Articles (Direkonstruksi berdasarkan Model & RLS Policy)
CREATE TABLE IF NOT EXISTS "articles" (
    "article_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id"    UUID NOT NULL REFERENCES "users"("user_id") ON DELETE CASCADE,
    "title"      VARCHAR(255) NOT NULL,
    "summary"    TEXT,
    "category"   VARCHAR(100),
    "image_url"  TEXT,
    "views"      INT DEFAULT 0,
    "likes"      INT DEFAULT 0,
    "created_at" TIMESTAMPTZ DEFAULT now()
);

-- 12. Article Likes
CREATE TABLE IF NOT EXISTS "article_likes" (
    "like_id"    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "article_id" UUID NOT NULL REFERENCES "articles"("article_id") ON DELETE CASCADE,
    "user_id"    UUID NOT NULL REFERENCES "users"("user_id") ON DELETE CASCADE,
    "created_at" TIMESTAMPTZ DEFAULT now(),
    UNIQUE("article_id", "user_id")
);

-- 13. Article Bookmarks
CREATE TABLE IF NOT EXISTS "article_bookmarks" (
    "bookmark_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "article_id"  UUID NOT NULL REFERENCES "articles"("article_id") ON DELETE CASCADE,
    "user_id"     UUID NOT NULL REFERENCES "users"("user_id") ON DELETE CASCADE,
    "created_at"  TIMESTAMPTZ DEFAULT now(),
    UNIQUE("article_id", "user_id")
);

-- 14. Tips (Direkonstruksi berdasarkan Model & RLS Policy)
CREATE TABLE IF NOT EXISTS "tips" (
    "tip_id"     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id"    UUID NOT NULL REFERENCES "users"("user_id") ON DELETE CASCADE,
    "title"      VARCHAR(255) NOT NULL,
    "content"    TEXT NOT NULL,
    "category"   VARCHAR(100),
    "image_url"  TEXT,
    "created_at" TIMESTAMPTZ DEFAULT now()
);

-- 15. Notifications Log
CREATE TABLE IF NOT EXISTS "notifications" (
    "notification_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id"         UUID NOT NULL REFERENCES "users"("user_id") ON DELETE CASCADE,
    "title"           VARCHAR(255) NOT NULL,
    "message"         TEXT NOT NULL,
    "type"            VARCHAR(50) DEFAULT 'calorie_alert' CHECK (type IN ('calorie_alert', 'water_reminder', 'general')),
    "is_read"         BOOLEAN DEFAULT false,
    "created_at"      TIMESTAMPTZ DEFAULT now()
);

-- 16. Notification Settings (User Reminder Configuration)
CREATE TABLE IF NOT EXISTS "notification_settings" (
    "setting_id"     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id"        UUID NOT NULL REFERENCES "users"("user_id") ON DELETE CASCADE,
    "type"           TEXT NOT NULL CHECK (type IN ('breakfast', 'lunch', 'dinner', 'water')),
    "is_enabled"     BOOLEAN DEFAULT true,
    "hour"           INT NOT NULL CHECK (hour >= 0 AND hour <= 23),
    "minute"         INT NOT NULL CHECK (minute >= 0 AND minute <= 59),
    "custom_message" TEXT,
    "created_at"     TIMESTAMPTZ DEFAULT now(),
    "updated_at"     TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, type)
);


-- ────────────────────────────────────────────────────────────
-- STEP 2: Pembuatan Index Khusus (Optimasi Query)
-- ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_meal_plan_items_date 
  ON meal_plan_items(meal_date);

CREATE INDEX IF NOT EXISTS idx_meal_plans_activated 
  ON meal_plans(activated_at, expires_at);

CREATE INDEX IF NOT EXISTS idx_recipe_steps_recipe 
  ON recipe_steps(recipe_id, step_number);

CREATE INDEX IF NOT EXISTS idx_meal_plan_items_recipe 
  ON meal_plan_items(recipe_id);

CREATE INDEX IF NOT EXISTS idx_recipes_package 
  ON recipes(package_id);


-- ────────────────────────────────────────────────────────────
-- STEP 3: Fungsi & Trigger Otomatis (Database Automation)
-- ────────────────────────────────────────────────────────────

-- A. Trigger: Auto-insert ke public.users saat Auth Signup Berhasil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    INSERT INTO public.users (user_id, name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        'user' -- Default signup role selalu 'user'
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- B. Trigger: Auto-insert Notification Settings Standar untuk User Baru
CREATE OR REPLACE FUNCTION public.handle_new_user_notif_settings()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO notification_settings (user_id, type, hour, minute, custom_message) VALUES
    (NEW.user_id, 'breakfast', 6,  15, 'Jangan lupa sarapan untuk memulai hari dengan energi penuh!'),
    (NEW.user_id, 'lunch',    12,  0,  'Sudah waktunya makan siang, jaga nutrisi harianmu!'),
    (NEW.user_id, 'dinner',   18, 30,  'Waktunya makan malam, catat makananmu di HealthPlate!'),
    (NEW.user_id, 'water',     8,  0,  'Jangan lupa minum air putih hari ini!');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_user_created_notif_settings ON users;
CREATE TRIGGER on_user_created_notif_settings
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_notif_settings();


-- ────────────────────────────────────────────────────────────
-- STEP 4: Pengaktifan RLS & Kebijakan Hak Akses (Security & RLS)
-- ────────────────────────────────────────────────────────────

ALTER TABLE "users"                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE "daily_logs"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "log_entries"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "meal_plans"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "meal_plan_items"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "recipes"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE "recipe_steps"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bahan_resep"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_bookmarks"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "food_products"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "food_category"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "meal_categories"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "meal_packages"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notification_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "articles"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "article_likes"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "article_bookmarks"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tips"                  ENABLE ROW LEVEL SECURITY;

-- === POLICIES: USERS ===
CREATE POLICY "users_select_all_for_join" ON "users" FOR SELECT USING (true);
CREATE POLICY "users_update_own" ON "users" FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users_admin_select_all" ON "users" FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM users WHERE role = 'admin') OR auth.uid() = user_id
);

-- === POLICIES: LOGS & ENTRIES ===
CREATE POLICY "daily_logs_own" ON "daily_logs" FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "log_entries_own" ON "log_entries" FOR ALL USING (
    EXISTS (SELECT 1 FROM daily_logs WHERE daily_logs.log_id = log_entries.log_id AND daily_logs.user_id = auth.uid())
);

-- === POLICIES: MEAL PLANS ===
CREATE POLICY "meal_plans_own" ON "meal_plans" FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "meal_plan_items_own" ON "meal_plan_items" FOR ALL USING (
    EXISTS (SELECT 1 FROM meal_plans WHERE meal_plans.plan_id = meal_plan_items.plan_id AND meal_plans.user_id = auth.uid())
);

-- === POLICIES: RECIPES & INGREDIENTS ===
CREATE POLICY "recipes_select_all" ON "recipes" FOR SELECT USING (true);
CREATE POLICY "recipes_insert_own" ON "recipes" FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "recipes_update_own" ON "recipes" FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "recipes_delete_own" ON "recipes" FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "recipes_admin_all" ON "recipes" FOR ALL USING (auth.uid() IN (SELECT user_id FROM users WHERE role = 'admin'));

CREATE POLICY "bahan_resep_select" ON "bahan_resep" FOR SELECT USING (true);
CREATE POLICY "bahan_resep_modify" ON "bahan_resep" FOR ALL USING (
    EXISTS (SELECT 1 FROM recipes WHERE recipes.recipe_id = bahan_resep.recipe_id AND (recipes.user_id = auth.uid() OR recipes.user_id IS NULL))
);

CREATE POLICY "recipe_steps_select" ON "recipe_steps" FOR SELECT USING (true);
CREATE POLICY "recipe_steps_modify" ON "recipe_steps" FOR ALL USING (
    EXISTS (SELECT 1 FROM recipes WHERE recipes.recipe_id = recipe_steps.recipe_id AND (recipes.user_id = auth.uid() OR recipes.user_id IS NULL))
);

CREATE POLICY "meal_categories_select" ON "meal_categories" FOR SELECT USING (true);
CREATE POLICY "meal_packages_select" ON "meal_packages" FOR SELECT USING (true);

-- === POLICIES: ARTICLES ===
CREATE POLICY "articles_select_all" ON "articles" FOR SELECT USING (true);
CREATE POLICY "articles_insert_own" ON "articles" FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "articles_update_own" ON "articles" FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "articles_delete_own" ON "articles" FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "articles_admin_all" ON "articles" FOR ALL USING (auth.uid() IN (SELECT user_id FROM users WHERE role = 'admin'));

-- === POLICIES: ARTICLE ENGAGEMENTS ===
CREATE POLICY "article_likes_select_all" ON "article_likes" FOR SELECT USING (true);
CREATE POLICY "article_likes_insert_own" ON "article_likes" FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "article_likes_delete_own" ON "article_likes" FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "article_bookmarks_select_all" ON "article_bookmarks" FOR SELECT USING (true);
CREATE POLICY "article_bookmarks_insert_own" ON "article_bookmarks" FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "article_bookmarks_delete_own" ON "article_bookmarks" FOR DELETE USING (auth.uid() = user_id);

-- === POLICIES: TIPS ===
CREATE POLICY "tips_select_all" ON "tips" FOR SELECT USING (true);
CREATE POLICY "tips_insert_own" ON "tips" FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tips_update_own" ON "tips" FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tips_delete_own" ON "tips" FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "tips_admin_all" ON "tips" FOR ALL USING (auth.uid() IN (SELECT user_id FROM users WHERE role = 'admin'));

-- === POLICIES: SYSTEM INTERNALS ===
CREATE POLICY "bookmarks_own" ON "user_bookmarks" FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "notifications_own" ON "notifications" FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "food_products_select" ON "food_products" FOR SELECT USING (true);
CREATE POLICY "food_category_select" ON "food_category" FOR SELECT USING (true);
CREATE POLICY "notif_settings_own" ON "notification_settings" FOR ALL USING (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- STEP 5: Initial Master Seed Data (DML)
-- ────────────────────────────────────────────────────────────

-- Insert Kategori Makanan Dasar
INSERT INTO food_category (name) VALUES
('Makanan Pokok'), ('Minuman'), ('Snack'), ('Buah & Sayur'), ('Protein')
ON CONFLICT DO NOTHING;

-- Insert Contoh Produk Makanan
INSERT INTO food_products (category_id, barcode_code, product_name, brand_name, serving_size_g, calories_kcal, sugar_g, carbohydrate_g, protein_g, fat_g)
VALUES
((SELECT category_id FROM food_category WHERE name = 'Makanan Pokok'), '8992388011089', 'Indomie Goreng', 'Indomie', 85, 400, 8, 72, 8, 14),
((SELECT category_id FROM food_category WHERE name = 'Makanan Pokok'), '8992388011090', 'Nasi Putih', NULL, 100, 130, 0, 28, 2.7, 0.3),
((SELECT category_id FROM food_category WHERE name = 'Protein'), '8992388011091', 'Telur Ayam', NULL, 50, 77, 0.6, 0.6, 6, 5),
((SELECT category_id FROM food_category WHERE name = 'Minuman'), '8992388011092', 'Teh Botol Sosro', 'Sosro', 350, 150, 36, 38, 0, 0),
((SELECT category_id FROM food_category WHERE name = 'Snack'), '8992388011093', 'Chitato Sapi Panggang', 'Chitato', 68, 340, 3, 42, 4, 17),
((SELECT category_id FROM food_category WHERE name = 'Buah & Sayur'), NULL, 'Pisang Ambon', NULL, 100, 89, 12, 23, 1.1, 0.3),
((SELECT category_id FROM food_category WHERE name = 'Protein'), NULL, 'Dada Ayam', NULL, 100, 165, 0, 0, 31, 3.6),
((SELECT category_id FROM food_category WHERE name = 'Makanan Pokok'), '8992388011094', 'Roti Tawar Sari Roti', 'Sari Roti', 35, 80, 4, 15, 3, 1)
ON CONFLICT (barcode_code) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- STEP 6: Setup Akun Admin (Opsional / Jalankan Manual)
-- ────────────────────────────────────────────────────────────
-- Ambil email akun admin dari Supabase Auth lalu jalankan query ini jika ingin memberikan akses admin panel:
-- UPDATE users SET role = 'admin' WHERE email = 'admin@healthplate.com';
