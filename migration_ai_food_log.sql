-- Migration Sprint BE-5.2: Update log_entries check constraint and add AI columns
ALTER TABLE log_entries DROP CONSTRAINT IF EXISTS log_entries_source_check;
ALTER TABLE log_entries ADD CONSTRAINT log_entries_source_check CHECK (source IN ('manual', 'barcode', 'recipe', 'meal_plan', 'ai_prediction'));

ALTER TABLE log_entries ADD COLUMN IF NOT EXISTS ai_confidence INTEGER;
ALTER TABLE log_entries ADD COLUMN IF NOT EXISTS ai_reasoning TEXT;
