-- Migration Sprint 4D.1: Database Performance Indexing
-- File: migration_sprint4d1_indexes.sql

-- 1. Create index for log_id on log_entries table
CREATE INDEX IF NOT EXISTS idx_log_entries_log_id
ON log_entries(log_id);

-- 2. Create composite index for user_id and log_date on daily_logs table
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date
ON daily_logs(user_id, log_date);

-- 3. Create composite index for user_id and created_at on notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_user_created
ON notifications(user_id, created_at DESC);
