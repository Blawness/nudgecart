---
name: nudgecart-conventions
description: Use when working on the NudgeCart Indonesian e-grocery marketplace built with Next.js 16, Drizzle ORM, and NextAuth v5. Prevents common database, auth, and Next.js 16 breaking-change errors.
---

# NudgeCart Project Conventions

## Overview

NudgeCart (forked from Pasarku) is an Indonesian e-grocery marketplace with three roles: `BUYER`, `MERCHANT`, `ADMIN`. Built on Next.js 16 App Router with Drizzle ORM + PostgreSQL. This skill prevents the most common errors agents make in this codebase.

## Critical Gotchas

### Database

- **Monetary values are integers in Rupiah** — no floats anywhere. `price: integer("price").notNull()`
- **DATABASE_URL must use `127.0.0.1`, NOT `localhost`** — the postgres driver interprets `localhost` as a Unix socket, authenticating as the OS user instead of `postgres`
- **Drizzle seed script must preload dotenv** — `drizzle.config.ts` and `drizzle/seed.ts` explicitly load `.env.local` via `dotenv`. Next.js auto-loads `.env.local` for server components; do NOT add dotenv to `lib/db.ts`
- **Run DB setup in order**: `pnpm db:generate` → `pnpm db:migrate` → `pnpm db:seed`
- **PostgreSQL must be running** locally: `sudo service postgresql start`

### Auth

- **Session strategy MUST be `"jwt"`** — the `Credentials` provider is incompatible with `strategy: "database"` when combined with DrizzleAdapter. This produces `UnsupportedStrategy` errors at runtime
- **Route protection lives in `proxy.ts`**, not `middleware.ts`. NextAuth's `auth()` function wraps the middleware as a default export; the `config.matcher` is also exported from `proxy.ts`
- **Auth check pattern in API routes:**
  ```ts
  const session = await auth();
  const userRole = (session?.user as unknown as Record<string, unknown>)?.role as string | undefined;
  if (userRole !== "ADMIN") { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  ```

### Next.js 16 Breaking Changes

- **`params`, `searchParams`, `cookies()`, `headers()` all return Promises** — must be `await`ed
- **Turbopack is default** — no `--turbopack` flag needed for `pnpm dev`
- **`cacheComponents` is NOT configured** — do not use `'use cache'` directives without first enabling it in `next.config.ts`

### UI

- **Base UI Button with `render={<Link />}` must receive `nativeButton={false}`** — Base UI Button defaults to `nativeButton={true}`. The wrapper in `components/ui/button.tsx` auto-detects this: if a `render` prop is present, it sets `nativeButton={false}`. When creating new Buttons that use `render`, pass the `render` prop and it's handled automatically
- **shadcn/ui uses `base-nova` style, `neutral` base color, CSS variables enabled** — see `components.json`
- **All monetary values displayed use `formatRupiah()`** from `lib/utils.ts` — formats integer Rupiah to readable string

### UploadThing

- **UploadThing v7 router is in `lib/uploadthing.ts`** — endpoint `productImage` configured
- **Client components use `generateUploadButton` / `generateUploadDropzone`** from `@uploadthing/react`
- **UploadThing domain for next/image**: `o76166p4ua.ufs.sh` must be in `images.remotePatterns`

## API Response Conventions

All Route Handlers follow this pattern:

```ts
// Success
return NextResponse.json({ data: result });

// Paginated
return NextResponse.json({ data, total, page, limit });

// Error
return NextResponse.json({ error: "message" }, { status: 400 });
```

## File Structure

```
app/
  (public)/       # Guest pages: homepage, product detail, categories
  (auth)/         # Login, register, register/merchant
  (buyer)/        # Protected: cart, checkout, orders, profile
  merchant/       # Protected: dashboard, products, orders
  admin/          # Protected: products, merchants, categories, orders, banners
  api/            # Route Handlers
```

## State Management

- **Server state**: TanStack Query calling Route Handlers
- **Cart drawer open/close**: Zustand `stores/cartStore.ts`
- **Actual cart data**: Lives in DB (`carts` + `cartItems` tables), NOT localStorage

## Testing

- **Playwright**: E2E tests in `tests/`. Requires `LD_LIBRARY_PATH` prefix (see `package.json`). Auto-starts dev server
- **Vitest**: Unit tests with `pnpm test:unit`
- **No typecheck script** — TypeScript strict mode enforced during `next build`

## Common Agent Mistakes

| Mistake | Fix |
|---------|-----|
| Using `localhost` in DATABASE_URL | Use `127.0.0.1` |
| Adding `config()` to `lib/db.ts` | Next.js auto-loads `.env.local` for server components |
| Using `strategy: "database"` in auth | Must use `strategy: "jwt"` with Credentials provider |
| Forgetting `await` on `cookies()`, `headers()`, `params` | Next.js 16 returns Promises |
| Using `as Record<string, unknown>` directly on session.user | Use `as unknown as Record<string, unknown>` first (TS 5.9 strictness) |
| Setting `nativeButton={false}` globally on Button wrapper | The wrapper auto-detects `render` prop; only set per-instance if needed |
| Forgetting to add UploadThing domain to `images.remotePatterns` | Add `o76166p4ua.ufs.sh` to `next.config.ts` |
| Using floats for prices | All monetary values must be integers (Rupiah) |
| Writing client-side cart persistence | Cart data lives in PostgreSQL, not localStorage |

## Quick Commands

```bash
pnpm dev          # Dev server (Turbopack default)
pnpm build        # Production build
pnpm lint         # ESLint
pnpm db:generate  # Generate migrations from schema
pnpm db:migrate   # Apply migrations
pnpm db:studio    # Drizzle Studio GUI
pnpm db:seed      # Seed database (needs .env.local)
pnpm test         # Playwright E2E
pnpm test:unit    # Vitest unit tests
```

## Seed Data

Default seed creates:
- Admin user: `admin@pasarku.id` / `password123`
- Buyer user: `buyer@pasarku.id` / `password123`
- Merchant: `merchant@pasarku.id` / `password123`
- 15 products with real images from `grocery-img.json`
- 4 promo banners

## Key Relationships

- One order = one merchant (not multi-merchant)
- `orderItems` snapshots `productName` and `productPrice` at checkout
- Stock decrement at checkout must use a PostgreSQL transaction
- New merchants start with `PENDING` status; admin must approve to `ACTIVE`
