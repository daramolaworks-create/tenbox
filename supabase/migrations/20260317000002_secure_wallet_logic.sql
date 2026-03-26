-- Server-side logic to handle wallet balance updates securely.
-- This prevents clients from manipulating their own balance.

-- 1. Handle Cashback on Order Creation
CREATE OR REPLACE FUNCTION public.handle_order_cashback()
RETURNS TRIGGER AS $$
DECLARE
  is_shopper BOOLEAN;
  cashback_amount NUMERIC;
BEGIN
  -- Check if user is a shopper
  SELECT (account_type = 'shopper') INTO is_shopper
  FROM public.profiles
  WHERE id = NEW.user_id;

  IF is_shopper THEN
    -- Calculate 1% cashback (on total for simplicity, or we could pass subtotal if available in DB)
    cashback_amount := NEW.total * 0.01;
    
    UPDATE public.profiles
    SET wallet_balance = wallet_balance + cashback_amount
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_order_created_cashback ON public.orders;
CREATE TRIGGER on_order_created_cashback
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.handle_order_cashback();


-- 2. Handle Balance Deduction on Withdrawal Request
CREATE OR REPLACE FUNCTION public.handle_withdrawal_deduction()
RETURNS TRIGGER AS $$
DECLARE
  current_bal NUMERIC;
BEGIN
  -- Get current balance
  SELECT wallet_balance INTO current_bal
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Verify sufficient funds (secondary check, app should also check)
  IF current_bal < NEW.amount THEN
    RAISE EXCEPTION 'Insufficient wallet balance';
  END IF;

  -- Deduct balance
  UPDATE public.profiles
  SET wallet_balance = wallet_balance - NEW.amount
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_withdrawal_created_deduction ON public.withdrawals;
CREATE TRIGGER on_withdrawal_created_deduction
  BEFORE INSERT ON public.withdrawals
  FOR EACH ROW EXECUTE PROCEDURE public.handle_withdrawal_deduction();


-- 3. Handle Balance Restoration on Failed Withdrawal
CREATE OR REPLACE FUNCTION public.handle_withdrawal_failed_restoration()
RETURNS TRIGGER AS $$
BEGIN
  -- If status changes to 'failed', 'rejected', or 'requires_manual_review' (potentially), refund balance?
  -- For now, let's implement for 'failed' or 'rejected'.
  IF (NEW.status IN ('failed', 'rejected')) AND (OLD.status = 'pending') THEN
    UPDATE public.profiles
    SET wallet_balance = wallet_balance + NEW.amount
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_withdrawal_status_change_restoration ON public.withdrawals;
CREATE TRIGGER on_withdrawal_status_change_restoration
  AFTER UPDATE OF status ON public.withdrawals
  FOR EACH ROW EXECUTE PROCEDURE public.handle_withdrawal_failed_restoration();
