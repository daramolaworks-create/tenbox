-- Create cart_items table
create table if not exists cart_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  product_id text, -- Optional: ID from external product if applicable
  title text not null,
  store text,
  quantity int default 1,
  notes text,
  image text,
  price numeric,
  url text,
  currency text default 'USD',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint cart_items_user_product_unique unique (user_id, product_id)
);

-- Enable RLS
alter table cart_items enable row level security;

-- Policies
create policy "Users can view their own cart items"
  on cart_items for select
  using (auth.uid() = user_id);

create policy "Users can insert their own cart items"
  on cart_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own cart items"
  on cart_items for update
  using (auth.uid() = user_id);

create policy "Users can delete their own cart items"
  on cart_items for delete
  using (auth.uid() = user_id);
