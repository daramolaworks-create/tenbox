-- 1. Create the Webhook Trigger Function
-- This securely calls your new Edge Function whenever a withdrawal is inserted.
--
-- SETUP: Before deploying, replace the placeholder values below:
--   1. YOUR_PROJECT_REF → your Supabase project ref (e.g., pjmjkdqofaiieitsjbpn)
--   2. YOUR_SERVICE_ROLE_KEY → from Dashboard → Settings → API → service_role key
--   3. YOUR_WEBHOOK_SECRET → the secret you set in Edge Function Secrets
--
-- SECURITY NOTE: These values are stored server-side in the DB function definition
-- (not exposed to clients). Rotate keys if this migration is committed to a public repo.

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
    -- Perform an asynchronous HTTP POST to the Edge Function
    SELECT
      net.http_post(
        url:='https://pjmjkdqofaiieitsjbpn.supabase.co/functions/v1/process_payout',
        headers:=json_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('supabase.service_role_key', true),
          'x-webhook-secret', current_setting('supabase.webhook_secret', true)
        )::jsonb,
        body:=json_build_object(
          'type', TG_OP,
          'table', TG_TABLE_NAME,
          'schema', TG_TABLE_SCHEMA,
          'record', row_to_json(NEW),
          -- OLD is always NULL for INSERT triggers; included for payload consistency
          'old_record', NULL
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
