
-- Create a storage bucket for app assets
CREATE BUCKET IF NOT EXISTS app_assets;

-- Set bucket to public
UPDATE storage.buckets
SET public = TRUE
WHERE name = 'app_assets';
