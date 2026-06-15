-- Migration Sprint BF-3B: AI Food Log Media Columns
ALTER TABLE log_entries ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE log_entries ADD COLUMN IF NOT EXISTS ai_image_path TEXT;
