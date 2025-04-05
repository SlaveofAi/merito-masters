
-- Add metadata column to chat_messages if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'chat_messages' 
    AND column_name = 'metadata'
  ) THEN
    ALTER TABLE public.chat_messages ADD COLUMN metadata JSONB DEFAULT NULL;
  END IF;
END $$;

-- Create booking_images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'booking_images', 'booking_images', true
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'booking_images'
);

-- Create RLS policies for booking_images storage bucket
-- Policy to allow authenticated users to select from the bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Anyone can read booking_images'
  ) THEN
    CREATE POLICY "Anyone can read booking_images" 
    ON storage.objects 
    FOR SELECT 
    USING (bucket_id = 'booking_images');
  END IF;
  
  -- Policy to allow authenticated users to insert into the bucket
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Authenticated users can upload booking_images'
  ) THEN
    CREATE POLICY "Authenticated users can upload booking_images" 
    ON storage.objects 
    FOR INSERT 
    WITH CHECK (
      bucket_id = 'booking_images' AND 
      auth.role() = 'authenticated'
    );
  END IF;
END $$;
