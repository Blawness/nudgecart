# NudgeCart Update & Bugfix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the client-requested NudgeCart feature updates and bug fixes without unrelated refactors.

**Architecture:** Reuse the existing Next.js 16 App Router structure, Drizzle schema, `userPreferences`, cart APIs, and buyer route group. Add reusable promo UI and deterministic savings calculations, keeping future database-backed promo support possible.

**Tech Stack:** Next.js 16 App Router, React 19, Drizzle ORM, PostgreSQL, NextAuth v5 JWT sessions, TanStack Query, Tailwind CSS, Playwright.

---

### Task 1: Navigation and Promo Bundles

**Files:**
- Modify: `components/layout/BottomNav.tsx`
- Modify: `components/layout/Navbar.tsx`
- Modify/delete: `app/(public)/brands/page.tsx`
- Modify: `app/(public)/promo/page.tsx`
- Create: `components/promo/BundlePromoCard.tsx`
- Create: `lib/promo-data.ts`
- Modify: `tests/nudgecart.spec.ts`

- [ ] Add failing Playwright assertions for mobile `Promo`, missing `Brand`, and `/promo` `Package` + `Tebus Murah`.
- [ ] Replace mobile `Chat CS` with `Promo`.
- [ ] Align account links to `/account` for buyer account access.
- [ ] Remove visible Brand navigation and ensure `/brands` is not part of user navigation.
- [ ] Build reusable bundle card with computed savings and responsive layout.
- [ ] Use the bundle card in `/promo`.
- [ ] Run relevant Playwright tests or document environment blockers.

### Task 2: Onboarding and Home Personalization

**Files:**
- Modify: `app/(buyer)/onboarding/page.tsx`
- Modify: `app/api/nudge/preference/route.ts`
- Modify: `app/(public)/page.tsx`
- Modify: `tests/nudgecart.spec.ts`

- [ ] Add failing Playwright assertions for onboarding question/options/helper text.
- [ ] Simplify onboarding to one multi-select category step.
- [ ] Save selected ids or skipped state through `/api/nudge/preference`.
- [ ] Keep Home redirect behavior for buyers without completed/skipped onboarding.
- [ ] Map selected ids to existing product category keywords.
- [ ] Render `Produk Pilihan` and `Promo Pilihan` with safe fallback when preferences are empty.
- [ ] Run relevant Playwright tests or document environment blockers.

### Task 3: Cart, Checkout, and Account Savings

**Files:**
- Modify: `app/(buyer)/cart/page.tsx`
- Modify: `components/cart/CartSummary.tsx`
- Modify: `app/(buyer)/checkout/page.tsx`
- Modify: `app/api/orders/route.ts`
- Modify: `app/api/user/stats/route.ts`
- Modify: `app/(buyer)/profile/page.tsx`
- Create: `app/(buyer)/account/page.tsx`
- Modify: `proxy.ts`
- Modify: `tests/nudgecart.spec.ts`

- [ ] Add failing Playwright assertions for `/account` protection and account labels.
- [ ] Add user-toggleable default cart promo and update summary totals.
- [ ] Show checkout savings from deterministic promo savings.
- [ ] Show dismissible food-loss popup only after successful checkout.
- [ ] Add `/account` route and include account summary, total saved, and settings menu rows.
- [ ] Extend stats API with `totalSaved` without fabricating unavailable product discount history.
- [ ] Update buyer route protection for `/account`.
- [ ] Run relevant Playwright tests or document environment blockers.

### Task 4: Integration Verification

**Files:**
- Review all files touched by Tasks 1-3.

- [ ] Resolve any merge conflicts or overlapping edits from subagents.
- [ ] Run `pnpm lint`.
- [ ] Run `pnpm build`.
- [ ] Run focused Playwright tests if the environment is available.
- [ ] Do final code review for scope compliance and regressions.
