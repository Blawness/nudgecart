# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
pnpm dev          # Start dev server (Turbopack default, no flag needed)
pnpm build        # Production build
pnpm lint         # ESLint

pnpm db:generate  # Generate Drizzle migrations from schema changes 
pnpm db:migrate   # Apply migrations to the database
pnpm db:studio    # Open Drizzle Studio (DB GUI)
pnpm db:seed      # Seed the database (drizzle/seed.ts)

pnpm test          # Run Playwright tests (headless)
pnpm test:ui       # Playwright UI mode
pnpm test:headed   # Playwright headed mode
```

No typecheck script exists, but the project uses TypeScript strict mode. Copy `.env.example` to `.env.local` and fill in values before running.

## Architecture

**Pasarku** is an Indonesian e-grocery marketplace (quick commerce). Three user roles: `BUYER`, `MERCHANT`, `ADMIN`. Prices are stored as integers in Rupiah (no floats). One order = one merchant (not multi-merchant per order).

### Stack
- **Next.js 16** (App Router) — Server Components by default
- **Drizzle ORM** + PostgreSQL — schema in `drizzle/schema.ts`, migrations in `drizzle/migrations/`
- **NextAuth.js v5** — credentials-only (email+password), JWT session strategy, config in `lib/auth.ts`
- **TanStack Query** — server state fetching from Route Handlers
- **Zustand** — UI-only cart state (drawer open/close, adding indicator) in `stores/cartStore.ts`
- **UploadThing v7** — product image uploads, router in `lib/uploadthing.ts`
- **Resend** — email (mock for v1)
- **shadcn/ui** + Tailwind CSS v4

### Route groups
```
app/
  (public)/       # Guest-accessible: homepage, product detail, category, merchant pages
  (auth)/         # login, register, register/merchant
  (buyer)/        # Protected: cart, checkout, orders, profile
  merchant/       # Protected: dashboard, products CRUD, orders
  admin/          # Protected: merchant approval, categories, orders
  api/            # Route Handlers (REST)
```

Route protection is handled via NextAuth middleware in `proxy.ts`. Role-based guards: `/merchant/*` requires `MERCHANT` role with `ACTIVE` status; `/admin/*` requires `ADMIN` role.

### Data flow
- Public pages fetch data directly in Server Components via Drizzle
- Buyer/merchant actions go through Route Handlers under `app/api/`
- Client components use TanStack Query to call those Route Handlers
- Cart drawer state (open/close) and add-to-cart loading state live in Zustand (`stores/cartStore.ts`); the actual cart data is server-side in the DB

### Key Next.js 16 breaking changes
- `cookies()`, `headers()`, `params`, `searchParams` — all must be `await`ed (Promises)
- `cacheComponents` is not configured — do not use `'use cache'` directives without first enabling it in `next.config.ts`
- Turbopack is the default bundler; no `--turbopack` flag needed

### Database schema highlights
- `users` has `passwordHash` (bcrypt) and `role` enum
- `merchants` has `status` enum (`PENDING`/`ACTIVE`/`SUSPENDED`) — new merchants start `PENDING`
- `products.price` and all monetary fields are `integer` (Rupiah, no decimals)
- `orderItems` snapshots `productName` and `productPrice` at checkout time
- Cart is persisted in DB (`carts` + `cartItems`), not localStorage
- Stock decrement at checkout must use a PostgreSQL transaction to prevent race conditions

### API conventions
- Route Handlers return `{ data: T }` on success (`ApiSuccess<T>` from `types/index.ts`)
- Route Handlers return `{ error: string }` on failure (`ApiError`)
- Paginated endpoints return `PaginatedResponse<T>` with `{ data, total, page, limit }`
- Auth check pattern: `const session = await auth(); if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })`
