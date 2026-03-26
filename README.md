# Tenbox Mobile App

Tenbox is an Expo React Native mobile app for cross-border shopping and shipping. Users can browse supported stores, import products into a Tenbox cart, check out with delivery selection, ship parcels, and track shipments.

## Current Scope

- Email/password auth plus Google and Apple sign-in via Supabase
- Persisted cart state with Supabase sync for signed-in users
- Store browsing and in-app web import flow
- Checkout flow with live shipping-rate lookup and Stripe payment sheet setup
- Parcel shipping flow with label purchase via Shippo
- Shipment tracking via Shippo
- Address book, order history, and shopper wallet withdrawal flow

## Stack

- Expo / React Native / TypeScript
- Zustand for app state
- Supabase for auth, data, storage, realtime, and edge functions
- Stripe for checkout and payout rails
- Shippo for rates, labels, and tracking

## Repo Shape

- [App.tsx](/Users/wudan/Downloads/tenbox-mobile-starter/App.tsx) is the main app shell and tab orchestration layer
- [store.ts](/Users/wudan/Downloads/tenbox-mobile-starter/store.ts) contains most client-side domain logic
- [components](/Users/wudan/Downloads/tenbox-mobile-starter/components) contains feature views and flows
- [lib/supabase.ts](/Users/wudan/Downloads/tenbox-mobile-starter/lib/supabase.ts) configures the mobile Supabase client
- [supabase/functions](/Users/wudan/Downloads/tenbox-mobile-starter/supabase/functions) contains edge functions for rates, payment sheet setup, label purchase, tracking, and payouts
- [supabase/migrations](/Users/wudan/Downloads/tenbox-mobile-starter/supabase/migrations) contains SQL for RLS and supporting tables

## Environment

The mobile app expects these public env vars:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`

Supabase edge functions also require server-side secrets such as:

- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `SHIPPO_API_KEY`
- `WEBHOOK_SECRET`
- `SHIPPO_WEBHOOK_SECRET`

## Security Notes

- Client-owned tables should be protected by RLS. This repo currently includes policies for `cart_items`, `orders`, `products`, `withdrawals`, `addresses`, and `shipments`.
- High-trust operations should derive the acting user from the bearer token server-side rather than trusting client-supplied `user_id`.
- The account deletion UI is not implemented end-to-end. Do not present it as a completed destructive action without a backend deletion path.

## Scripts

```bash
npx expo start
npx tsc --noEmit
npm test
```

## Regression Coverage

This repo uses lightweight Node-based regression checks under [tests](/Users/wudan/Downloads/tenbox-mobile-starter/tests) to guard against reintroducing the recent cart-scoping, checkout-origin, and backend-auth issues.

## Known Gaps

- Navigation and app orchestration are still concentrated in the top-level app/store rather than separated into clearer domain modules.
- There is still no full automated integration or E2E suite.
- Backend schema creation for some tables is assumed to exist outside this repo; the migrations here are additive hardening, not a full schema bootstrap.
