SELECT
    entry_id,
    image_url
FROM log_entries
WHERE image_url IS NOT NULL;
