-- DANGER: This script will delete ALL data and ALL users.
-- Run this in the Supabase Dashboard -> SQL Editor

-- 1. Truncate all application tables
TRUNCATE TABLE public.orders CASCADE;
TRUNCATE TABLE public.cart_items CASCADE;
TRUNCATE TABLE public.shipments CASCADE;
TRUNCATE TABLE public.addresses CASCADE;
TRUNCATE TABLE public.products CASCADE; -- Optional: if you want to clear products too

-- 2. Delete all users from Supabase Auth
-- This will also cascade to any tables referencing auth.users if set up correctly,
-- but the truncates above ensure clean slate anyway.
DELETE FROM auth.users;

-- 3. Confirmation
SELECT 'Database successfully wiped' as status;
