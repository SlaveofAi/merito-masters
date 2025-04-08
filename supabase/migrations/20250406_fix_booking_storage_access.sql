
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

-- We'll create RLS policies for the bucket from a separate migration
-- to avoid RLS errors in the client-side code

-- Update any contacts with composite IDs to ensure they have proper UUIDs
