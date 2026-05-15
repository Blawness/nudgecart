# Pasarku MVP Spec

**Date:** 2026-05-14
**Stack:** Next.js 16, Drizzle ORM, Auth.js v5, Tailwind v4, shadcn/ui, pnpm

## MVP Decisions

- All 6 PRD features included
- Seed data: 6 categories, 1 admin, 1 demo merchant with 15 products
- Auto-verified registration (no email confirmation)
- Mock payment: BANK_TRANSFER / COD, no real gateway
- No automated tests for MVP

## Build Approach: Vertical Slice (C)

### Foundation
- Next.js 16 init (`cacheComponents: true`, Turbopack default)
- 10 DB tables via Drizzle
- Auth.js v5 with database session (Credentials provider)
- role-based middleware
- Seed script

### C1: Public Journey
- `/` homepage (categories + featured)
- Search (full-text PostgreSQL)
- `/categories/[slug]`
- `/products/[slug]` (product detail + gallery)
- `/merchants/[id]`

### C2: Buyer Journey
- Register/Login → auto-verified
- `/cart` → persist DB, Zustand for UI
- `/checkout` → address picker, payment picker, order submit
- `/orders` + `/orders/[id]`
- `/profile` + address management

### C3: Merchant Journey
- Register merchant → PENDING status
- Dashboard with stats
- Product CRUD + UploadThing images
- Incoming orders + status update

### C4: Admin Journey
- Approve/reject/suspend merchant
- Category CRUD
- Monitor all orders

## Component Layout

```
components/
├── ui/              # shadcn/ui (never edit)
├── layout/          # Navbar, Footer, Sidebar
├── product/         # ProductCard, ProductGrid, SearchBar, CategoryNav
├── cart/            # CartItem, CartSummary, AddToCartButton
├── checkout/        # AddressPicker, PaymentMethodPicker
├── merchant/        # ProductForm, ProductTable, OrderTable, MerchantStats
├── admin/           # MerchantTable, CategoryForm
└── shared/          # EmptyState, LoadingSkeleton, StatusBadge
```

## State
- TanStack Query: server state (products, cart, orders)
- Zustand: cart drawer UI
- Auth.js: session + role

## Payment Flow (Mock)
Checkout → pilih alamat → pilih BANK_TRANSFER/COD → submit → order PENDING_PAYMENT → status di-update manual
