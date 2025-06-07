
-- Enable RLS on topped_payments table (if not already enabled)
ALTER TABLE public.topped_payments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow edge functions to insert payment records
-- This policy allows inserts when using the service role key
CREATE POLICY "allow_service_role_insert" ON public.topped_payments
FOR INSERT
WITH CHECK (true);

-- Create policy to allow edge functions to update payment records
-- This policy allows updates when using the service role key
CREATE POLICY "allow_service_role_update" ON public.topped_payments
FOR UPDATE
USING (true);

-- Create policy to allow craftsmen to view their own payment records
CREATE POLICY "craftsmen_can_view_own_payments" ON public.topped_payments
FOR SELECT
USING (craftsman_id = auth.uid());
