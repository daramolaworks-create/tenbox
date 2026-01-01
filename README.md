# Tenbox

**Tenbox is a global logistics platform that helps users ship parcels or shop from international stores and deliver worldwide by optimizing courier choice, cost, and delivery speed.**

Tenbox operates as a logistics decision engine — not a courier and not a marketplace.

---

## What Tenbox Does

Tenbox supports two core flows:

1. **Delivery-Only Shipping**
   Users enter origin, destination, and parcel details. Tenbox compares global couriers and lets users book and track shipments.

2. **Shop & Deliver (Link-Based Shopping)**
   Users copy product links from international stores (Amazon, Apple, ASOS, etc.). Tenbox imports the product details, groups items by origin country, creates separate shipments where required, and handles checkout and delivery.

One order can contain multiple shipments.
Each shipment has its own courier, customs declaration, and tracking.

---

## What Tenbox Is Not

* Tenbox does not own warehouses
* Tenbox does not sell products
* Tenbox does not consolidate shipments across countries in MVP
* Tenbox does not control courier operations

Tenbox provides **choice, transparency, and optimization**, not logistics infrastructure.

---

## Core Concepts

### Order

A single checkout session initiated by the user.

### Shipment

A logical delivery unit within an order.

* One origin country
* One courier
* Independent tracking
* Independent customs handling

### Cart Item

A product or parcel added to an order.

* May originate from an external store
* May require manual confirmation of details

---

## Product Architecture (High Level)

* **Frontend**

  * Web app (Next.js)
  * Supports delivery quotes, link-based product import, cart, and checkout

* **Backend**

  * API-first architecture
  * Handles:

    * Product link imports
    * Shipment grouping logic
    * Courier rate comparison
    * Order and tracking lifecycle

* **Integrations**

  * Courier APIs (DHL, FedEx, UPS, DPD)
  * Payment providers (Stripe, local gateways)
  * Headless browser for product metadata extraction

---

## Key Features

* Courier rate comparison
* Multi-shipment orders
* Link-based product import
* Clipboard detection (web)
* Unified checkout
* Per-shipment tracking
* Transparent pricing structure

---

## Clipboard Import Flow (Web)

Tenbox supports a clean web flow for adding products from external stores:

1. User opens a store (e.g. Amazon) in a new tab
2. Copies a product link
3. Returns to Tenbox
4. Clicks **Import from clipboard**
5. Tenbox parses the link and prompts for confirmation
6. Product is added to Tenbox cart

Clipboard access requires a user gesture and runs only on HTTPS.

---

## Running the Project Locally

```bash
# install dependencies
npm install

# start development server
npm run dev
```

Environment variables:

```bash
NEXT_PUBLIC_API_URL=
STRIPE_SECRET_KEY=
COURIER_API_KEY=
```

(See `.env.example` for the full list.)

---

## Folder Structure (Example)

```
/apps/web        # Next.js frontend
/apps/api        # Backend services
/packages/core   # Shared logic (orders, shipments, pricing)
/packages/utils  # Helpers and parsers
```

---

## Development Principles

* API-first
* Deterministic shipment logic
* Graceful degradation (manual fallback when parsing fails)
* No silent automation across third-party sites
* Transparency over abstraction

---

## Roadmap (High Level)

* Phase 1: Delivery-only (UK → Africa routes)
* Phase 2: Link-based shopping + subscriptions
* Phase 3: SME shipping, consolidation, API access

---

## Legal & Compliance Notes

* Tenbox does not scrape user accounts or carts
* Product data is imported from publicly available URLs
* Users are responsible for product accuracy
* Customs, duties, and restricted items are handled per shipment

---

## Status

Tenbox is in active development.
APIs, flows, and supported routes may change.

---

## License

[To be defined]

---
