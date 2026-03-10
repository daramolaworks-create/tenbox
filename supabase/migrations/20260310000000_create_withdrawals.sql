-- Create the withdrawals table
CREATE TABLE IF NOT EXISTS public.withdrawals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    bank_details TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "Users can insert own withdrawals" ON public.withdrawals;

-- Create policies for withdrawals
-- Users can read their own withdrawals
CREATE POLICY "Users can view own withdrawals" 
ON public.withdrawals FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own withdrawals
CREATE POLICY "Users can insert own withdrawals" 
ON public.withdrawals FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Only service role / admins should be able to update withdrawals (e.g., status to complete)
-- Add an updated_at trigger
DROP TRIGGER IF EXISTS handle_withdrawals_updated_at ON public.withdrawals;
DROP FUNCTION IF EXISTS public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_withdrawals_updated_at
    BEFORE UPDATE ON public.withdrawals
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

-- Add wallet_balance to users (auth.users metadata or profiles if custom table)
-- Assuming we use auth.users.raw_user_meta_data for the profile as implemented in store.ts
-- Just an FYI, no SQL needed except maybe for securing other tables.
