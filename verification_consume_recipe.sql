SELECT
    le.meal_time,
    fp.product_name,
    le.consumed_calories,
    le.recipe_id,
    le.source
FROM log_entries le
JOIN food_products fp
    ON fp.product_id = le.product_id
ORDER BY le.created_at DESC;
