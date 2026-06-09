# NudgeCart Update & Bugfix Design

## Goal

Complete the client-requested NudgeCart improvements from `docs/scope nudgecart update & bugfix.md` by finishing existing partial implementations instead of rebuilding the app.

## Scope

The work is split into three slices:

1. Navigation and promo package UI: remove Brand from navigation, align desktop and mobile navigation, and make `/promo` a complete Alfagift-style promo page with reusable bundle cards.
2. Onboarding and Home personalization: simplify onboarding to the requested category picker, persist preferences in `userPreferences`, and use those preferences to filter `Produk Pilihan` and `Promo Pilihan`.
3. Cart, checkout, and account savings: make the default cart promo user-toggleable, surface computed savings in checkout, show a food-loss success popup after checkout, and provide a populated `/account` page.

## Architecture

Existing tables and APIs are reused wherever possible. User preferences stay in `userPreferences.favoriteCategories`; no new onboarding table is needed. Promo package data can start as static typed data because the scope does not require an admin promo CMS. Bundle cards expose a data shape that can later be backed by database entities.

Cart and checkout savings use deterministic computed values from current cart/order data. Because the current product model has only one price field, product-level historical discount savings are limited unless a later migration adds normal price snapshots; this implementation must avoid fabricated lifetime savings.

## Data Flow

Onboarding writes selected category ids to `/api/nudge/preference`, then redirects to Home. Home reads `userPreferences` server-side and maps the selected ids to category keywords for product filtering and promo bundle selection.

The cart page owns the default promo checked state and passes the resulting shipping discount into the summary. Checkout recomputes the same deterministic discount from the current cart state before creating orders, then shows a dismissible food-loss message only after order creation succeeds.

`/account` reads session data and `/api/user/stats`, including `totalSaved`, and displays a compact account dashboard. `/profile` remains available for existing links unless intentionally redirected.

## Error Handling

Route handlers keep the existing `{ data }` and `{ error }` response shape. Unauthenticated protected routes continue to redirect through `proxy.ts`. Empty preferences, empty promos, and empty carts render fallbacks instead of blank pages.

## Testing

Use focused Playwright coverage for public nav/promo behavior, onboarding copy/options, protected account routing, and cart/checkout smoke paths where feasible. Run `pnpm build` as the integration check after subagent patches are integrated.
