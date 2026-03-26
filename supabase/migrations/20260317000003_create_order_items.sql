-- Create order_items table for structured order details
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id TEXT,
  title TEXT NOT NULL,
  store TEXT,
  quantity INT DEFAULT 1,
  price NUMERIC(10, 2) NOT NULL,
  image TEXT,
  url TEXT,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Only service role should insert into order_items (usually done via Edge Function or Transactional SQL)
-- For now, allow trigger-based insertion if possible, or client insertion if order matches.
-- Actually, the client creates the order, so it should probably insert items too in a transaction.
-- Supabase doesn't easily support multi-table insert in one RPC without custom function.
-- Let's allow users to insert if they own the parent order.

DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;
CREATE POLICY "Users can insert own order items"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );
