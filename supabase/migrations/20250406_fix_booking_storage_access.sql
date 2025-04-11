
-- Create metadata column in chat_messages table if it doesn't exist
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

-- Enable full replica identity for realtime subscriptions
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.booking_requests REPLICA IDENTITY FULL;

-- Make sure RLS is enabled
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

-- Add tables to realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'booking_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_requests;
  END IF;
END $$;

-- Create RLS policies for chat_messages
DO $$ 
BEGIN
  -- Users can insert messages in their conversations
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
  
  -- Users can view messages in their conversations
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

  -- Users can update their own messages or mark messages as read
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'chat_messages' AND policyname = 'Users can update messages') THEN
    CREATE POLICY "Users can update messages"
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

-- Create RLS policies for booking_requests
DO $$ 
BEGIN
  -- Customers can insert booking requests
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'booking_requests' AND policyname = 'Customers can insert booking requests') THEN
    CREATE POLICY "Customers can insert booking requests"
      ON public.booking_requests
      FOR INSERT
      WITH CHECK (auth.uid() = customer_id);
  END IF;
  
  -- Users can view booking requests they're part of
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'booking_requests' AND policyname = 'Users can view their booking requests') THEN
    CREATE POLICY "Users can view their booking requests"
      ON public.booking_requests
      FOR SELECT
      USING (auth.uid() = customer_id OR auth.uid() = craftsman_id);
  END IF;

  -- Craftsmen can update booking requests assigned to them
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'booking_requests' AND policyname = 'Craftsmen can update booking requests') THEN
    CREATE POLICY "Craftsmen can update booking requests"
      ON public.booking_requests
      FOR UPDATE
      USING (auth.uid() = craftsman_id);
  END IF;
END $$;
