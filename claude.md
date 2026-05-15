# CLAUDE.md — Pasarku

> Dokumen ini adalah panduan utama untuk Claude Code saat bekerja di codebase Pasarku.
> Baca file ini setiap kali memulai sesi baru. Ikuti semua aturan di sini secara konsisten.

---

## 1. Project Overview

**Pasarku** adalah e-grocery marketplace berbasis Indonesia (quick commerce).
Pengguna bisa belanja bahan makanan dari merchant lokal, checkout, dan lacak pesanan.

Referensi PRD lengkap: `PRD-pasarku.md`

---

## 2. Tech Stack — JANGAN diganti tanpa konfirmasi

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 — **App Router only**, bukan Pages Router |
| Language | TypeScript 5 — **strict mode**, tidak boleh ada `any` |
| Database | PostgreSQL 16 |
| ORM | Drizzle ORM — schema di `drizzle/schema.ts` |
| Auth | NextAuth.js v5 (Auth.js) — database session strategy |
| Styling | Tailwind CSS v3 + shadcn/ui |
| State | TanStack Query untuk server state, Zustand untuk cart UI |
| Upload | UploadThing v7 — `UPLOADTHING_TOKEN` (bukan `UPLOADTHING_SECRET`) |
| Email | Resend |
| Deploy | Vercel |
| Package Manager | **pnpm** — jangan pakai npm atau yarn |

---

## 3. Aturan Coding

### General
- Selalu gunakan **TypeScript strict** — tidak ada `as any`, tidak ada `@ts-ignore`
- Semua file menggunakan **named export**, bukan default export (kecuali `page.tsx` dan `layout.tsx` yang wajib default export oleh Next.js)
- Gunakan **`const`** bukan `let` jika nilai tidak berubah
- Semua string user-facing dalam **Bahasa Indonesia**
- Semua komentar kode boleh dalam **Bahasa Inggris**

### Next.js 16 App Router
- **Server Components by default** — jangan tambahkan `"use client"` kecuali benar-benar perlu (event handler, hooks, browser API)
- Data fetching dilakukan di Server Component, bukan di client dengan `useEffect`
- Gunakan **Route Handlers** di `app/api/**` untuk semua endpoint API
- Gunakan `next/image` untuk semua gambar — jangan pakai `<img>` raw
- Gunakan `next/link` untuk semua navigasi internal — jangan pakai `<a>` raw
- **Turbopack** adalah bundler default — tidak perlu flag `--turbopack` di `dev`/`build` scripts
- **cacheComponents: true** di `next.config.ts` — untuk Cache Components + PPR
- **Semua Request-time APIs wajib async**:
  - `await cookies()` — bukan `cookies()`
  - `await headers()` — bukan `headers()`
  - `params` dan `searchParams` adalah `Promise<>` — wajib `await` di `page.tsx`, `layout.tsx`, `generateMetadata`
  - Tidak ada synchronous fallback (UnsafeUnwrapped sudah dihapus di 16)

### Drizzle ORM
- Schema terpusat di `drizzle/schema.ts` — jangan buat schema di file lain
- Jalankan migrasi dengan: `pnpm drizzle-kit migrate`
- Jangan pernah edit file di `drizzle/migrations/` secara manual
- Gunakan **PostgreSQL transactions** untuk operasi yang melibatkan multiple tabel (contoh: checkout mengurangi stok + membuat order)
- Contoh query:
  ```typescript
  // ✅ Benar
  const products = await db.select().from(productsTable).where(eq(productsTable.isActive, true));

  // ❌ Salah — jangan raw SQL kecuali sangat perlu
  const products = await db.execute(sql`SELECT * FROM products`);
  ```

### Komponen & Styling
- Gunakan komponen dari **shadcn/ui** sebelum membuat komponen baru
- Install komponen shadcn dengan: `pnpm dlx shadcn@latest add <component>`
- Jangan override style shadcn dengan CSS inline — gunakan `className` dengan Tailwind
- Gunakan helper `cn()` dari `lib/utils.ts` untuk conditional className
- Semua icon dari **lucide-react** — jangan import dari library lain

### Error Handling
- Semua Route Handler harus memiliki try-catch dan return response yang proper:
  ```typescript
  // ✅ Benar
  try {
    // logic
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("[ROUTE_NAME]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
  ```
- Gunakan `notFound()` dari `next/navigation` jika resource tidak ditemukan di Server Component

### Format Rupiah
- Selalu gunakan helper `formatRupiah()` dari `lib/utils.ts` untuk display harga
- Harga disimpan di database sebagai **integer (Rupiah)** — bukan float, bukan dalam ribuan

---

## 4. Struktur Folder

```
pasarku/
├── app/
│   ├── (public)/          # Halaman publik (beranda, produk, merchant)
│   ├── (auth)/            # Login, register buyer & merchant
│   ├── (buyer)/           # Halaman buyer: cart, checkout, orders, profil
│   ├── merchant/          # Dashboard merchant (protected)
│   ├── admin/             # Panel admin (protected)
│   └── api/               # Route Handlers
├── components/
│   ├── ui/                # shadcn/ui primitives (jangan edit manual)
│   ├── product/           # ProductCard, ProductGrid, ProductDetail
│   ├── cart/              # CartDrawer, CartItem, CartSummary
│   ├── checkout/          # CheckoutForm, AddressPicker, OrderSummary
│   ├── merchant/          # ProductForm, OrderTable, MerchantStats
│   └── layout/            # Navbar, Footer, Sidebar
├── lib/
│   ├── db.ts              # Drizzle client — import dari sini, jangan buat instance baru
│   ├── auth.ts            # NextAuth config
│   ├── uploadthing.ts     # UploadThing config
│   └── utils.ts           # cn(), formatRupiah(), slugify()
├── drizzle/
│   ├── schema.ts          # SATU-SATUNYA tempat definisi schema
│   └── migrations/        # Auto-generated — jangan edit manual
├── hooks/                 # Custom React hooks (client-side only)
├── stores/                # Zustand stores
│   └── cartStore.ts
├── types/
│   └── index.ts           # Shared types & interfaces
└── middleware.ts          # Route protection berdasarkan role
```

---

## 5. Auth & Authorization

### Role System
```typescript
type UserRole = "BUYER" | "MERCHANT" | "ADMIN";
```

### Route Protection (middleware.ts)
- `/merchant/*` → hanya role `MERCHANT` dengan status `ACTIVE`
- `/admin/*` → hanya role `ADMIN`
- `/(buyer)/*` → semua user yang sudah login
- Route lain → public (guest boleh akses)

### Cara cek session di Server Component
```typescript
import { auth } from "@/lib/auth";

const session = await auth();
if (!session?.user) redirect("/login");
```
> **Next.js 16:** `cookies()` dan `headers()` sudah fully async — auth helpers sudah handle ini secara internal.

### Cara cek session di Route Handler
```typescript
const session = await auth();
if (!session?.user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### Cara akses cookies/headers di Route Handler (Next.js 16)
```typescript
import { cookies, headers } from "next/headers";

// ✅ Async — Next.js 16 required
const cookieStore = await cookies();
const token = cookieStore.get("token");

const headersList = await headers();
const userAgent = headersList.get("user-agent");
```

---

## 6. User Roles & Permissions

| Role | Bisa Akses |
|------|-----------|
| `Guest` | Browse produk, halaman merchant, search |
| `Buyer` | Cart, checkout, orders, profil, alamat |
| `Merchant` | Dashboard merchant, kelola produk & stok, lihat pesanan toko |
| `Admin` | Approve merchant, kelola kategori, monitor semua order |

**Penting:** Merchant hanya boleh akses data milik tokonya sendiri. Selalu filter query dengan `merchantId` yang cocok dengan session user.

---

## 7. Database — Entitas Utama

```
User → Merchant (1:1, optional)
User → Address (1:many)
User → Cart (1:1)
Cart → CartItem (1:many)
CartItem → Product (many:1)
Merchant → Product (1:many)
Product → ProductImage (1:many)
Product → Category (many:1)
User → Order (1:many)
Order → OrderItem (1:many)
```

**Order status flow:**
```
PENDING_PAYMENT → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
                                                    ↘ CANCELLED (buyer/merchant bisa cancel sebelum SHIPPED)
```

---

## 8. API Conventions

- Base path: `/api/`
- Merchant endpoints: `/api/merchant/`
- Admin endpoints: `/api/admin/`
- Semua response JSON dengan format:
  ```typescript
  // Success
  { data: T }

  // Error
  { error: string }

  // Paginated
  { data: T[], total: number, page: number, limit: number }
  ```
- HTTP status codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error

---

## 9. Environment Variables

Semua env var wajib ada di `.env.local`:

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
UPLOADTHING_TOKEN=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=
```

Jangan pernah hardcode value env var di dalam kode.
Akses env var via `process.env.VARIABLE_NAME` — bukan dari file config lain.

---

## 10. Commands

```bash
# Development (Turbopack is default bundler in Next.js 16 — no flag needed)
pnpm dev

# Build
pnpm build

# Database
pnpm drizzle-kit generate   # generate migration dari schema
pnpm drizzle-kit migrate    # jalankan migration
pnpm drizzle-kit studio     # buka Drizzle Studio (GUI)

# shadcn
pnpm dlx shadcn@latest add <component>

# Type check
pnpm tsc --noEmit

# Next.js 16 codemods (jika upgrade dari versi lama)
pnpm dlx @next/codemod@canary upgrade latest
pnpm dlx @next/codemod@latest next-async-request-api .
```

---

## 11. Hal yang TIDAK Boleh Dilakukan

- ❌ Jangan buat file `.env` — gunakan `.env.local`
- ❌ Jangan commit `.env.local` ke git
- ❌ Jangan pakai `useEffect` untuk data fetching — gunakan Server Component atau TanStack Query
- ❌ Jangan pakai `fetch()` langsung dari client untuk protected endpoint — gunakan TanStack Query dengan credentials
- ❌ Jangan edit file di `components/ui/` — itu milik shadcn, update via CLI
- ❌ Jangan pakai `float` untuk harga — selalu `integer` (Rupiah)
- ❌ Jangan buat Drizzle client baru — selalu import dari `lib/db.ts`
- ❌ Jangan akses data merchant lain dari dalam merchant route

---

## 12. Out of Scope (Jangan Implementasi)

Hal-hal berikut **tidak termasuk** MVP v1 — tolak jika diminta:

- OAuth login (Google/Facebook)
- Payment gateway real (Midtrans/Xendit)
- Integrasi kurir real (JNE/GoSend)
- Review & rating produk
- Fitur chat buyer-merchant
- Loyalty points / voucher
- Mobile native app
- Rekomendasi produk ML/AI
- Analitik dashboard dengan chart

---

*CLAUDE.md ini di-generate dari PRD-pasarku.md — update jika PRD berubah.*
