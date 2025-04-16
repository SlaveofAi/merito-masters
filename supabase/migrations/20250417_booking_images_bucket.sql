
-- Create a new storage bucket for booking images
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('booking_images', 'booking_images', true, false, 5242880, '{image/jpeg,image/png,image/gif,image/webp}');

-- Set up public access policy for the bucket (read only)
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'booking_images');
  
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'booking_images');
  
-- Allow users to update their own images
CREATE POLICY "Users can update own images" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'booking_images' AND auth.uid() = owner);
  
-- Allow users to delete their own images
CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'booking_images' AND auth.uid() = owner);
