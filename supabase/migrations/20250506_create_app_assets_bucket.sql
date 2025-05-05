
-- Create app_assets storage bucket for storing app assets like logos
INSERT INTO storage.buckets (id, name, public)
SELECT 'app_assets', 'app_assets', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'app_assets'
);

-- Set up storage policy to allow public access to app_assets bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Public Access' AND bucket_id = 'app_assets'
  ) THEN
    INSERT INTO storage.policies (name, bucket_id, operation, definition)
    VALUES ('Public Access', 'app_assets', 'SELECT', '(bucket_id = ''app_assets''::text)');
  END IF;
END
$$;
