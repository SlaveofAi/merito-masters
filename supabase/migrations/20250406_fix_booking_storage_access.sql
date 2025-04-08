
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

-- Fix booking request functionality to properly store metadata
CREATE OR REPLACE FUNCTION create_booking_request(
  p_conversation_id UUID,
  p_craftsman_id UUID,
  p_customer_id UUID,
  p_customer_name TEXT,
  p_date DATE,
  p_start_time TEXT,
  p_end_time TEXT,
  p_message TEXT DEFAULT NULL,
  p_image_url TEXT DEFAULT NULL,
  p_amount TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  booking_id UUID := gen_random_uuid();
BEGIN
  -- Insert into booking_requests table
  INSERT INTO booking_requests(
    id, conversation_id, craftsman_id, customer_id, customer_name,
    date, start_time, end_time, message, image_url, amount
  ) VALUES (
    booking_id, p_conversation_id, p_craftsman_id, p_customer_id, p_customer_name,
    p_date, p_start_time, p_end_time, p_message, p_image_url, p_amount
  );
  
  RETURN booking_id;
END;
$$ LANGUAGE plpgsql;
