-- HealthPlate backend audit follow-up:
-- 1. Allow log entries without product_id by storing manual food names.
-- 2. Store daily consumption photos per log entry.

ALTER TABLE log_entries
  ADD COLUMN IF NOT EXISTS custom_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMENT ON COLUMN log_entries.custom_name IS 'Manual food name for custom logging when product_id is null.';
COMMENT ON COLUMN log_entries.image_url IS 'Public URL for uploaded consumption photo.';
