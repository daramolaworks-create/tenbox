import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('cart mutations stay scoped by user_id', () => {
  const store = read('store.ts');
  assert.match(store, /\.delete\(\)[\s\S]*?\.eq\('user_id', session\.user\.id\)[\s\S]*?\.eq\('product_id', id\)/);
  assert.match(store, /\.update\(\{ quantity \}\)[\s\S]*?\.eq\('user_id', session\.user\.id\)[\s\S]*?\.eq\('product_id', id\)/);
  assert.match(store, /\.delete\(\)[\s\S]*?\.eq\('user_id', session\.user\.id\)[\s\S]*?then\(\(\{ error \}\) =>/);
});

test('checkout derives shipping origin from normalized store region', () => {
  const checkout = read('components/CheckoutFlow.tsx');
  assert.match(checkout, /STORE_ADDRESSES\[getStoreRegion\(items\[0\]\.store\)\]/);
});

test('payment sheet derives identity from server-side auth', () => {
  const fn = read('supabase/functions/payment-sheet/index.ts');
  assert.match(fn, /const token = authHeader\?\.replace/);
  assert.match(fn, /supabase\.auth\.getUser\(token\)/);
  assert.doesNotMatch(fn, /const \{ amount, currency, email, name \} = body/);
});

test('create-label no longer trusts client supplied user_id', () => {
  const fn = read('supabase/functions/create-label/index.ts');
  assert.match(fn, /supabase\.auth\.getUser\(token\)/);
  assert.match(fn, /user_id: authData\.user\.id/);
  assert.doesNotMatch(fn, /const \{ rate_id, user_id, shipment_details \} = await req\.json\(\)/);
});

test('addresses and shipments have RLS hardening migration', () => {
  const sql = read('supabase/migrations/20260317000000_secure_addresses_shipments.sql');
  assert.match(sql, /ALTER TABLE public\.addresses ENABLE ROW LEVEL SECURITY;/);
  assert.match(sql, /ALTER TABLE public\.shipments ENABLE ROW LEVEL SECURITY;/);
  assert.match(sql, /CREATE POLICY "Users can view own addresses"/);
  assert.match(sql, /CREATE POLICY "Users can view own shipments"/);
});
