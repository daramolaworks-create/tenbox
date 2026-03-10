-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- 1. Secure the 'orders' table
-- This prevents users from seeing other people's orders or tracking numbers
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (safe rerun)
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;

-- Policy: Users can only SELECT rows where user_id matches their authentication token
CREATE POLICY "Users can view own orders" 
ON public.orders FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can only INSERT rows if they set user_id to themselves
CREATE POLICY "Users can insert own orders" 
ON public.orders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Optional - Allow users to update their own orders if they are still 'Processing'
-- (This is useful if you let them cancel an order before shipment)
CREATE POLICY "Users can update own orders"
ON public.orders FOR UPDATE
USING (auth.uid() = user_id AND status = 'Processing')
WITH CHECK (auth.uid() = user_id AND status = 'Processing');


-- 2. Secure the 'products' table
-- Products should be visible to everyone, but only editable by admins
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Only Service Role can modify products" ON public.products;

-- Policy: Anyone (even guests) can SELECT products to browse the catalog
CREATE POLICY "Anyone can view products" 
ON public.products FOR SELECT 
USING (true);

-- By NOT creating INSERT/UPDATE/DELETE policies for authenticated users on the `products` table, 
-- we naturally lock it down. Only the Supabase Dashboard / Service Key can modify the catalog now.
