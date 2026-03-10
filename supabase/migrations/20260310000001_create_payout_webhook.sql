-- 1. Create the Webhook Trigger Function
-- This securely calls your new Edge Function whenever a withdrawal is inserted
CREATE OR REPLACE FUNCTION public.invoke_payout_edge_function()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_id bigint;
BEGIN
  -- We only want to trigger this when a new withdrawal is explicitly "pending"
  IF NEW.status = 'pending' THEN
    -- Perform an asynchronous HTTP POST to your Edge Function
    -- Replace 'YOUR_PROJECT_REF' with your actual Supabase project reference
    SELECT
      net.http_post(
        url:='https://pjmjkdqofaiieitsjbpn.supabase.co/functions/v1/process_payout',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqbWprZHFvZmFpaWVpdHNqYnBuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODE1NjA4NCwiZXhwIjoyMDgzNzMyMDg0fQ.xBW3ahbgAnqTiYrArihPazcWVYVRMTPrvGsJr5E9wQ0", "x-webhook-secret": "rEjmon-8pyvra-pynbyw"}'::jsonb,
        body:=json_build_object(
          'type', TG_OP,
          'table', TG_TABLE_NAME,
          'schema', TG_TABLE_SCHEMA,
          'record', row_to_json(NEW),
          'old_record', row_to_json(OLD)
        )::jsonb
      ) INTO request_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 2. Attach the Webhook to the Withdrawals Table
-- This fires the function specifically AFTER an INSERT occurs
DROP TRIGGER IF EXISTS trigger_payout_edge_function ON public.withdrawals;

CREATE TRIGGER trigger_payout_edge_function
AFTER INSERT ON public.withdrawals
FOR EACH ROW
EXECUTE FUNCTION public.invoke_payout_edge_function();
