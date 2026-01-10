# Tenbox Mobile App

Tenbox is a mobile logistics platform that helps users ship parcels internationally and shop from global stores using a single checkout and delivery layer.

This repository contains the **React Native (Expo) mobile app** for Tenbox.

---

## Product Overview

Tenbox allows users to:

- Ship parcels internationally by comparing courier options
- Shop from global stores (Amazon, Apple, ASOS, etc.)
- Import product details into a Tenbox cart
- Check out once, even when items ship from different countries
- Track shipments end-to-end

The app is **not a courier** and **not a marketplace**.  
Tenbox acts as a decision and orchestration layer between stores and global couriers.

Tagline: **Delivering Choice and Efficiency**

---

## Tech Stack

- React Native (Expo)
- TypeScript
- React Navigation (tabs + stacks)
- Zustand (state management)
- React Query (API calls)
- react-native-webview (in-app browser)
- Expo Secure Store

---

## App Structure

```

/app
/navigation
/screens
/components
/store
/services
/theme
App.tsx

````

### Key Screens

- Home
- Shop (Store Directory + Add by Link)
- In-App Browser (WebView)
- Cart
- Checkout (placeholder)
- Tracking
- Account

---

## Core Features (Current)

- Store directory (Amazon, Apple, etc.)
- In-app browser for external stores
- Floating “Add to Tenbox Cart” button
- Product import preview (edit before adding)
- Local cart state
- Manual fallback when product parsing fails
- Dark, minimal UI

---

## What’s Intentionally Out of Scope

- Payments
- Real courier quotes
- Real tracking integrations
- Authentication
- Backend APIs

These will be added incrementally.

---

## Getting Started

### Prerequisites

- Node.js (18+ recommended)
- npm or yarn
- Expo Go app (for quick testing)

---

### Install Dependencies

```bash
npm install
````

or

```bash
yarn
```

---

### Run the App (Expo)

```bash
npx expo start
```

* Scan the QR code using **Expo Go** (iOS / Android)
* Or run on simulator/emulator

---

## Building Testable App Builds

### Android (APK)

```bash
eas build -p android --profile preview
```

### iOS (TestFlight)

```bash
eas build -p ios --profile preview
eas submit -p ios
```

> iOS builds require an Apple Developer account.

---

## Development Notes

* The app uses **mocked product parsing** and local state for now.
* Product import is triggered via:

  * Paste link flow
  * In-app browser floating button
* Always show an import preview before adding items to cart.
* Manual product entry must always be possible.

---

## Design Principles

* Infrastructure-first UI
* Dark, technical, minimal
* Clarity over aesthetics
* No unnecessary animations
* No fake marketplace behavior

---

## Future Work

* Courier quote engine
* Multi-shipment checkout logic
* Payments
* Real tracking
* Authentication
* Backend integration
* Store-specific parsing improvements

---

## License

Private – Tenbox internal use only.
