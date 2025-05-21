
-- Make sure the profile_images storage bucket exists and has proper permissions

-- Create profile_images storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('profile_images', 'profile_images', true, false, 5242880, '{image/jpeg,image/png,image/gif,image/webp}')
ON CONFLICT (id) DO NOTHING;

-- Set up public access policy for the bucket (read only)
CREATE POLICY IF NOT EXISTS "Public Access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'profile_images');
  
-- Allow authenticated users to upload images
CREATE POLICY IF NOT EXISTS "Authenticated users can upload" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'profile_images');
  
-- Allow users to update their own images
CREATE POLICY IF NOT EXISTS "Users can update own images" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'profile_images' AND auth.uid() = owner);
  
-- Allow users to delete their own images
CREATE POLICY IF NOT EXISTS "Users can delete own images" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'profile_images' AND auth.uid() = owner);
