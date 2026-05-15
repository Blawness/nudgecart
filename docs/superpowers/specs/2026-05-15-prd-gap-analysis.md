# PRD Gap Analysis — NudgeCart

**Date:** 2026-05-15
**Status:** Baseline audit comparing codebase against PRD v1.0

---

## Summary

**The entire NudgeCart System (Feature 6) is unimplemented.** The codebase is the Pasarku fork with zero nudge features added. Core e-grocery features (auth, catalog, cart, checkout, orders, merchant, admin) are solid and functional.

---

## Missing Files & Directories

| Expected (PRD Section 10) | Status |
|---|---|
| `app/(buyer)/onboarding/page.tsx` | **Missing** |
| `app/admin/nudge/page.tsx` | **Missing** |
| `app/api/nudge/` (8 endpoints) | **Missing** — entire directory |
| `app/api/user/` (addresses/profile CRUD) | **Missing** — referenced by checkout |
| `components/nudge/` (9 components) | **Missing** — entire directory |
| `lib/nudge-engine.ts` | **Missing** |
| `stores/nudgeStore.ts` | **Missing** |
| `hooks/useNudge.ts` | **Missing** |
| `hooks/useCart.ts` | **Missing** |
| `hooks/useAuth.ts` | **Missing** |
| `hooks/` directory | Exists but **empty** |

---

## Database Schema Gaps

### Missing NudgeCart fields in `products` table

| Field | Type | Feature |
|---|---|---|
| `isEcoFriendly` | `boolean` | 6.5 |
| `ecoLabel` | `enum("FRESH", "ECONOMICAL", "POPULAR")` | 6.5 |
| `ecoTooltip` | `text` | 6.5 |
| `socialNormType` | `enum("WEEKLY_BUYERS", "LOCAL_BUYERS")` | 6.6 |
| `carbonFootprint` | `decimal` | 6.4.3 |

### Missing tables entirely

| Table | Feature | Fields |
|---|---|---|
| `userPreferences` | 6.1 | `userId`, `favoriteCategories`, `lifestyleType`, `shoppingFrequency`, `onboardingCompleted` |
| `nudgeLogs` | 6.4 | `userId`, `sessionId`, `nudgeType`, `framingType`, `nudgeContext`, `productId`, `alternativeProductId`, `event` |
| `nudgeFeedback` | 6.8 | `userId`, `sessionId`, `rating` |

---

## Feature-by-Feature Gaps

### Feature 1: Authentication & User Management
**Status:** Mostly implemented.
- Login, register buyer, register merchant: OK
- Route protection via `proxy.ts`: OK
- Profile page, addresses: OK (but `app/api/user/` endpoints missing)

**Gaps:**
- [ ] Post-register redirect to `/onboarding` — onboarding page not built

### Feature 2: Product Catalog & Search
**Status:** Implemented.
- Product listing, search, categories, detail page, pagination: OK

**Gaps:**
- [ ] Eco-label badge on product cards/detail (Feature 6.5)
- [ ] Social norm data on eco product detail (Feature 6.6)
- [ ] Personalized recommendation section on beranda (Feature 6.2)

### Feature 3: Shopping Cart & Checkout
**Status:** Implemented.
- Add/remove/update cart, persistent DB cart, checkout flow: OK

**Gaps:**
- [ ] Just-in-Time Nudge on add-to-cart (Feature 6.4.1)
- [ ] Pre-Checkout Nudge on `/cart` page (Feature 6.4.2)
- [ ] Last-Chance Nudge on `/checkout` page (Feature 6.4.3)

### Feature 4: Order Management
**Status:** Implemented.
- Buyer order list/detail, merchant order management, cancel flow: OK

**Gaps:**
- [ ] Post-Purchase Nudge on order confirmation page (Feature 6.4.4)

### Feature 5: Merchant Dashboard & Product Management
**Status:** Core CRUD implemented.
- Product CRUD, image upload, order management: OK

**Gaps:**
- [ ] `isEcoFriendly` toggle in `ProductForm`
- [ ] `ecoLabel` selector in `ProductForm`
- [ ] `ecoTooltip` text input in `ProductForm`
- [ ] `carbonFootprint` input in `ProductForm`

---

## NudgeCart System (Feature 6) — Complete Gap Map

### 6.1 Onboarding Preferensi `[X1]`
**Status:** Not started.

| AC | Requirement | Status |
|---|---|---|
| 6.1.1 | `/onboarding` page post-register | **Missing** |
| 6.1.2 | 5-step visual preference quiz | **Missing** |
| 6.1.3 | Skip button with `ONBOARDING_SKIPPED` event | **Missing** |
| 6.1.4 | `UserPreference` table in schema | **Missing** |
| 6.1.5 | `POST /api/nudge/preference` endpoint | **Missing** |
| 6.1.6 | Micro-copy text | **Missing** |

### 6.2 Rekomendasi Produk Personal `[X1]`
**Status:** Not started.

| AC | Requirement | Status |
|---|---|---|
| 6.2.1 | "Pilihan untuk [Nama]" section on beranda | **Missing** |
| 6.2.2 | Rule-based recommendation logic | **Missing** |
| 6.2.3 | "Produk Ramah Lingkungan Untukmu" section | **Missing** |
| 6.2.4 | `.RecommendationSection` component | **Missing** |
| 6.2.5 | `GET /api/nudge/recommendations` endpoint | **Missing** |
| 6.2.6 | "Alternatif Pilihan" block on product detail | **Missing** |

### 6.3 Promo Personal `[X1]`
**Status:** Not started.

| AC | Requirement | Status |
|---|---|---|
| 6.3.1 | Personal promo banner in beranda carousel | **Missing** |
| 6.3.2 | `.PersonalPromoBanner` component | **Missing** |
| 6.3.3 | `PROMO_PERSONAL_CLICK` event logging | **Missing** |
| 6.3.4 | Fallback to generic promo if no purchase history | **Missing** |

### 6.4 Timing of Nudges — Display System `[X2]`
**Status:** Not started.

| AC | Requirement | Status |
|---|---|---|
| 6.4.1 | Just-in-Time Nudge (add to cart bottom sheet) | **Missing** |
| 6.4.2 | Pre-Checkout Nudge (cart page inline banner) | **Missing** |
| 6.4.3 | Last-Chance Nudge (checkout static block) | **Missing** |
| 6.4.4 | Post-Purchase Nudge (order confirmation) | **Missing** |
| 6.4.x | `nudge-engine.ts` with timing rules | **Missing** |
| 6.4.x | `stores/nudgeStore.ts` (Zustand session state) | **Missing** |
| 6.4.x | `NudgeLog` table | **Missing** |
| 6.4.x | `POST /api/nudge/evaluate` endpoint | **Missing** |
| 6.4.x | `POST /api/nudge/log` endpoint | **Missing** |

### 6.5 Eco-Label System `[X3]`
**Status:** Not started.

| AC | Requirement | Status |
|---|---|---|
| 6.5.1 | Three eco-label types (`FRESH`, `ECONOMICAL`, `POPULAR`) | **Missing** |
| 6.5.2 | `.EcoLabel` badge component | **Missing** |
| 6.5.3 | Tooltip popover on label click | **Missing** |
| 6.5.4 | Eco fields in product DB schema | **Missing** |

### 6.6 Social Norm Framing `[X3]`
**Status:** Not started.

| AC | Requirement | Status |
|---|---|---|
| 6.6.1 | Social norm text on eco product detail | **Missing** |
| 6.6.2 | `.SocialNormBadge` component | **Missing** |
| 6.6.3 | Two variants: `WEEKLY_BUYERS`, `LOCAL_BUYERS` | **Missing** |

### 6.7 Gain vs Loss Framing `[X3]`
**Status:** Not started.

| AC | Requirement | Status |
|---|---|---|
| 6.7.1 | Framing determined by `nudgeContext` | **Missing** |
| 6.7.2 | `GAIN` for HOME/PRODUCT_DETAIL | **Missing** |
| 6.7.3 | `LOSS` for CART/CHECKOUT | **Missing** |
| 6.7.4 | `framingType` recorded in `NudgeLog` | **Missing** |

### 6.8 Nudge Feedback — Mini Survey `[X4]`
**Status:** Not started.

| AC | Requirement | Status |
|---|---|---|
| 6.8.1 | Trigger after 3 nudge interactions in session | **Missing** |
| 6.8.2 | Star rating snackbar (1-5) | **Missing** |
| 6.8.3 | `.NudgeFeedbackSnackbar` component | **Missing** |
| 6.8.4 | `NudgeFeedback` table | **Missing** |
| 6.8.5 | `POST /api/nudge/feedback` endpoint | **Missing** |

---

## API Endpoints Gap

### NudgeCart Endpoints (all missing)

| Method | Endpoint | Status |
|--------|----------|--------|
| `GET` | `/api/nudge/preference` | **Missing** |
| `POST` | `/api/nudge/preference` | **Missing** |
| `GET` | `/api/nudge/recommendations` | **Missing** |
| `POST` | `/api/nudge/evaluate` | **Missing** |
| `POST` | `/api/nudge/log` | **Missing** |
| `GET` | `/api/nudge/log` | **Missing** |
| `POST` | `/api/nudge/feedback` | **Missing** |
| `GET` | `/api/admin/nudge/analytics` | **Missing** |

### User Endpoints (referenced but missing)

| Method | Endpoint | Status |
|--------|----------|--------|
| `GET` | `/api/user/addresses` | **Missing** |
| `POST` | `/api/user/addresses` | **Missing** |
| `PUT` | `/api/user/profile` | **Missing** |

---

## Other Gaps

| Item | Detail |
|---|---|
| `framer-motion` | Not installed — PRD lists it for nudge animations (bottom sheet, confetti) |
| App branding | Navbar still shows "Pasarku" — should be "NudgeCart" |
| TypeScript types | `types/index.ts` missing NudgeCart types (`NudgeLog`, `UserPreference`, `NudgeFeedback`) |
| `next-auth.d.ts` | Needs `role` field in session type augmentation |

---

## What IS Implemented (Foundation)

| Layer | Status |
|---|---|
| Auth (NextAuth v5, Credentials provider, JWT sessions) | Solid |
| Product catalog with search + categories | Solid |
| Shopping cart (DB-persistent) | Solid |
| Checkout flow (address, payment, order creation) | Solid |
| Order management (buyer + merchant + admin) | Solid |
| Merchant dashboard (product CRUD, order processing) | Solid |
| Admin panel (merchant approval, categories, orders) | Solid |
| File upload (UploadThing) | Solid |
| Route protection (`proxy.ts`) | Solid |
| DB schema (core tables: users, merchants, products, orders, carts) | Solid |
| UI components (shadcn/ui, Tailwind) | Solid |

---

*Generated from PRD v1.0 vs codebase scan on 2026-05-15*
