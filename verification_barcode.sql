SELECT
    meal_time,
    source,
    consumed_calories,
    portion,
    created_at
FROM log_entries
WHERE source = 'barcode'
ORDER BY created_at DESC;
