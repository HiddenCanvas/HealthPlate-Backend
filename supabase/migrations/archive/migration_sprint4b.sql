-- Migration Sprint 4B: Add modern notification preferences to notification_settings
-- File: migration_sprint4b.sql

ALTER TABLE "notification_settings"
ADD COLUMN IF NOT EXISTS "push_enabled" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "mealplan_enabled" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "reminder_enabled" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "article_enabled" BOOLEAN DEFAULT true;
