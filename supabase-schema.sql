-- ============================================================
-- HealthPlate Supabase SQL schema (fixed table order)
-- ============================================================

-- 1. Food Category (no dependencies)
CREATE TABLE IF NOT EXISTS "food_category" (
    "category_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name"        VARCHAR(255) NOT NULL,
    "created_at"  TIMESTAMPTZ DEFAULT now()
);

-- 2. Food Products (depends on food_category)
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
    "created_at"     TIMESTAMPTZ DEFAULT now()
);

-- 3. Users (depends on auth.users)
CREATE TABLE IF NOT EXISTS "users" (
    "user_id"        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    "name"           VARCHAR(255) NOT NULL,
    "email"          VARCHAR(255) UNIQUE NOT NULL,
    "gender"         VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    "birth_date"     DATE,
    "weight_kg"      DECIMAL(5, 2) CHECK (weight_kg > 0),
    "height_cm"      DECIMAL(5, 2) CHECK (height_cm > 0),
    "calories_kcal"  DECIMAL(8, 2) CHECK (calories_kcal >= 0),
    "sugar_g"        DECIMAL(8, 2) CHECK (sugar_g >= 0),
    "carbohydrate_g" DECIMAL(8, 2) CHECK (carbohydrate_g >= 0),
    "protein_g"      DECIMAL(8, 2) CHECK (protein_g >= 0),
    "fat_g"          DECIMAL(8, 2) CHECK (fat_g >= 0),
    "created_at"     TIMESTAMPTZ DEFAULT now()
);

-- 4. Daily Logs (depends on users)
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

-- 5. Log Entries (depends on daily_logs + food_products)
CREATE TABLE IF NOT EXISTS "log_entries" (
    "entry_id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "log_id"            UUID NOT NULL REFERENCES "daily_logs"("log_id") ON DELETE CASCADE,
    "product_id"        UUID REFERENCES "food_products"("product_id") ON DELETE SET NULL,
    "meal_time"         VARCHAR(20) NOT NULL CHECK (meal_time IN ('Breakfast', 'Lunch', 'Dinner', 'Snack')),
    "portion"           DECIMAL(8, 2) NOT NULL CHECK (portion > 0),
    "consumed_calories" DECIMAL(8, 2) NOT NULL DEFAULT 0,
    "consumed_sugar"    DECIMAL(8, 2) NOT NULL DEFAULT 0,
    "consumed_carbs"    DECIMAL(8, 2) NOT NULL DEFAULT 0,
    "consumed_protein"  DECIMAL(8, 2) NOT NULL DEFAULT 0,
    "consumed_fat"      DECIMAL(8, 2) NOT NULL DEFAULT 0,
    "created_at"        TIMESTAMPTZ DEFAULT now()
);

-- 6. Meal Plans (depends on users)
CREATE TABLE IF NOT EXISTS "meal_plans" (
    "plan_id"   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id"   UUID NOT NULL REFERENCES "users"("user_id") ON DELETE CASCADE,
    "plan_name" VARCHAR(255) NOT NULL,
    "status"    VARCHAR(20) NOT NULL DEFAULT 'Draft'
                CHECK (status IN ('Active', 'Inactive', 'Draft')),
    "created_at" TIMESTAMPTZ DEFAULT now()
);

-- 7. Meal Plan Items (depends on meal_plans + food_products)
CREATE TABLE IF NOT EXISTS "meal_plan_items" (
    "item_id"    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "plan_id"    UUID NOT NULL REFERENCES "meal_plans"("plan_id") ON DELETE CASCADE,
    "product_id" UUID REFERENCES "food_products"("product_id") ON DELETE SET NULL,
    "meal_day"   VARCHAR(10) NOT NULL
                 CHECK (meal_day IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
    "meal_time"  VARCHAR(20) NOT NULL CHECK (meal_time IN ('Breakfast', 'Lunch', 'Dinner', 'Snack')),
    "portion"    DECIMAL(8, 2) NOT NULL CHECK (portion > 0)
);

-- 8. Recipes (depends on users)
CREATE TABLE IF NOT EXISTS "recipes" (
    "recipe_id"    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id"      UUID NOT NULL REFERENCES "users"("user_id") ON DELETE CASCADE,
    "recipe_name"  VARCHAR(255) NOT NULL,
    "description"  TEXT,
    "instructions" TEXT NOT NULL,
    "created_at"   TIMESTAMPTZ DEFAULT now(),
    "updated_at"   TIMESTAMPTZ DEFAULT now()
);

-- 9. Bahan Resep (depends on recipes + food_products)
CREATE TABLE IF NOT EXISTS "bahan_resep" (
    "bahan_id"   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "recipe_id"  UUID NOT NULL REFERENCES "recipes"("recipe_id") ON DELETE CASCADE,
    "product_id" UUID REFERENCES "food_products"("product_id") ON DELETE SET NULL,
    "quantity"   DECIMAL(8, 2) NOT NULL CHECK (quantity > 0),
    "unit"       VARCHAR(50) NOT NULL
);

-- 10. User Bookmarks (depends on users + food_products + recipes)
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

-- 11. Notifications (depends on users)
CREATE TABLE IF NOT EXISTS "notifications" (
    "notification_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id"         UUID NOT NULL REFERENCES "users"("user_id") ON DELETE CASCADE,
    "title"           VARCHAR(255) NOT NULL,
    "message"         TEXT NOT NULL,
    "type"            VARCHAR(50) DEFAULT 'calorie_alert'
                      CHECK (type IN ('calorie_alert', 'water_reminder', 'general')),
    "is_read"         BOOLEAN DEFAULT false,
    "created_at"      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Trigger: auto-insert into public.users on Supabase Auth signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (user_id, name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE "users"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "daily_logs"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "log_entries"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "meal_plans"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "meal_plan_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "recipes"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bahan_resep"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_bookmarks"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "food_products"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "food_category"   ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Policies
-- ============================================================
CREATE POLICY "users_select_own" ON "users"
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_update_own" ON "users"
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "daily_logs_own" ON "daily_logs"
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "log_entries_own" ON "log_entries"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM daily_logs
            WHERE daily_logs.log_id = log_entries.log_id
            AND daily_logs.user_id = auth.uid()
        )
    );

CREATE POLICY "meal_plans_own" ON "meal_plans"
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "meal_plan_items_own" ON "meal_plan_items"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM meal_plans
            WHERE meal_plans.plan_id = meal_plan_items.plan_id
            AND meal_plans.user_id = auth.uid()
        )
    );

CREATE POLICY "recipes_select_all" ON "recipes"
    FOR SELECT USING (true);
CREATE POLICY "recipes_insert_own" ON "recipes"
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "recipes_update_own" ON "recipes"
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "recipes_delete_own" ON "recipes"
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "bahan_resep_select" ON "bahan_resep"
    FOR SELECT USING (true);
CREATE POLICY "bahan_resep_modify" ON "bahan_resep"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM recipes
            WHERE recipes.recipe_id = bahan_resep.recipe_id
            AND recipes.user_id = auth.uid()
        )
    );

CREATE POLICY "bookmarks_own" ON "user_bookmarks"
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "notifications_own" ON "notifications"
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "food_products_select" ON "food_products"
    FOR SELECT USING (true);
CREATE POLICY "food_category_select" ON "food_category"
    FOR SELECT USING (true);