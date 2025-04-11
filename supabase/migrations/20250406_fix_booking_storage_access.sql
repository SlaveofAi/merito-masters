
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

-- Create RLS policies for chat_messages to ensure proper security
DO $$ 
BEGIN
  -- Create policy that allows users to insert messages
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'chat_messages' AND policyname = 'Users can insert messages in their conversations') THEN
    CREATE POLICY "Users can insert messages in their conversations"
      ON public.chat_messages
      FOR INSERT
      WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
          SELECT 1 FROM public.chat_conversations
          WHERE id = chat_messages.conversation_id
          AND (auth.uid() = customer_id OR auth.uid() = craftsman_id)
        )
      );
  END IF;
END $$;
