-- 1. Verify indexes creation
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname IN (
    'idx_log_entries_log_id',
    'idx_daily_logs_user_date',
    'idx_notifications_user_created'
);

-- 2. Verify recipe system list (user_id IS NULL)
SELECT
    recipe_id,
    recipe_name,
    user_id
FROM recipes
WHERE user_id IS NULL
LIMIT 10;
