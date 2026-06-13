-- Migration Sprint 3A: Add recipe tracking and source to log_entries
-- File: migration_sprint3a.sql

ALTER TABLE "log_entries"
ADD COLUMN IF NOT EXISTS "recipe_id" UUID REFERENCES "recipes"("recipe_id") ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS "source" VARCHAR(20) DEFAULT 'manual' CHECK ("source" IN ('manual', 'barcode', 'recipe', 'meal_plan'));
