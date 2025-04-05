
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

-- Make sure RLS is enabled for all relevant tables
DO $$ 
BEGIN
  -- Enable RLS on tables if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    AND c.relname = 'chat_conversations'
    AND c.relrowsecurity = TRUE
  ) THEN
    ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    AND c.relname = 'chat_messages'
    AND c.relrowsecurity = TRUE
  ) THEN
    ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    AND c.relname = 'booking_requests'
    AND c.relrowsecurity = TRUE
  ) THEN
    ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    AND c.relname = 'craftsman_profiles'
    AND c.relrowsecurity = TRUE
  ) THEN
    ALTER TABLE public.craftsman_profiles ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    AND c.relname = 'customer_profiles'
    AND c.relrowsecurity = TRUE
  ) THEN
    ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Make sure RLS policies are created safely
DO $$ 
BEGIN
  -- Add policies only if they don't exist

  -- Chat Conversations policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'chat_conversations' AND policyname = 'Users can view their own conversations') THEN
    CREATE POLICY "Users can view their own conversations"
      ON public.chat_conversations
      FOR SELECT
      USING (auth.uid() = customer_id OR auth.uid() = craftsman_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'chat_conversations' AND policyname = 'Users can insert their own conversations') THEN
    CREATE POLICY "Users can insert their own conversations"
      ON public.chat_conversations
      FOR INSERT
      WITH CHECK (auth.uid() = customer_id OR auth.uid() = craftsman_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'chat_conversations' AND policyname = 'Users can update their own conversations') THEN
    CREATE POLICY "Users can update their own conversations"
      ON public.chat_conversations
      FOR UPDATE
      USING (auth.uid() = customer_id OR auth.uid() = craftsman_id);
  END IF;

  -- Chat Messages policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'chat_messages' AND policyname = 'Users can view messages in their conversations') THEN
    CREATE POLICY "Users can view messages in their conversations"
      ON public.chat_messages
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.chat_conversations
          WHERE id = chat_messages.conversation_id
          AND (auth.uid() = customer_id OR auth.uid() = craftsman_id)
        )
      );
  END IF;

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

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'chat_messages' AND policyname = 'Users can update read status of their messages') THEN
    CREATE POLICY "Users can update read status of their messages"
      ON public.chat_messages
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.chat_conversations
          WHERE id = chat_messages.conversation_id
          AND (auth.uid() = customer_id OR auth.uid() = craftsman_id)
        )
      );
  END IF;
END $$;
