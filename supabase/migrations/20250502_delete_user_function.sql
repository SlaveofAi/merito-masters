
-- Function to delete the current user
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void 
LANGUAGE plpgsql SECURITY DEFINER 
AS $$
DECLARE
  user_id UUID;
  craftsman_profile_exists BOOLEAN;
  customer_profile_exists BOOLEAN;
BEGIN
  -- Get the current user ID
  user_id := auth.uid();
  
  -- Check if profiles exist
  SELECT EXISTS (SELECT 1 FROM craftsman_profiles WHERE id = user_id) INTO craftsman_profile_exists;
  SELECT EXISTS (SELECT 1 FROM customer_profiles WHERE id = user_id) INTO customer_profile_exists;
  
  -- Delete data based on user type
  IF craftsman_profile_exists THEN
    -- Delete craftsman-specific data
    DELETE FROM portfolio_images WHERE craftsman_id = user_id;
    DELETE FROM craftsman_availability WHERE craftsman_id = user_id;
    DELETE FROM craftsman_review_replies WHERE craftsman_id = user_id;
    DELETE FROM craftsman_profiles WHERE id = user_id;
  END IF;
  
  IF customer_profile_exists THEN
    -- Delete customer-specific data
    DELETE FROM customer_profiles WHERE id = user_id;
  END IF;
  
  -- Delete shared data
  DELETE FROM chat_messages WHERE sender_id = user_id OR receiver_id = user_id;
  DELETE FROM chat_conversations WHERE customer_id = user_id OR craftsman_id = user_id;
  DELETE FROM booking_requests WHERE customer_id = user_id OR craftsman_id = user_id;
  DELETE FROM craftsman_reviews WHERE customer_id = user_id OR craftsman_id = user_id;
  DELETE FROM user_types WHERE user_id = user_id;
  DELETE FROM profiles WHERE id = user_id;
  
  -- Delete the user from auth.users
  -- Note: This requires that the function runs with security definer permissions
  DELETE FROM auth.users WHERE id = user_id;
END;
$$;
