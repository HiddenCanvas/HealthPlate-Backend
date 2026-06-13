-- Verification Queries for Notification System (Sprint 4B)
-- File: verification_notifications.sql

-- 1. Verify user notifications ordered by creation time (newest first)
SELECT
    notification_id,
    title,
    is_read,
    created_at
FROM notifications
ORDER BY created_at DESC;

-- 2. Verify modern notification preferences for users
SELECT
    setting_id,
    user_id,
    push_enabled,
    mealplan_enabled,
    reminder_enabled,
    article_enabled
FROM notification_settings;
