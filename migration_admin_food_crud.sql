-- Admin food CRUD support columns for existing HealthPlate databases.
-- Safe to run more than once.

ALTER TABLE food_category
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE food_products
  ADD COLUMN IF NOT EXISTS sodium_mg DECIMAL(8, 2),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE meal_plans
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
