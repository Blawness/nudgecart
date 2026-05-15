# PRD: Pasarku — E-Grocery Marketplace (Quick Commerce)

**Version:** 1.0  
**Date:** 2026-05-14  
**Author:** Product Team  
**Status:** Draft  

---

## 1. Overview

### 1.1 Product Summary
**Pasarku** adalah aplikasi e-grocery marketplace berbasis Indonesia yang memungkinkan pengguna membeli kebutuhan bahan makanan dan grocery sehari-hari dari berbagai toko/mitra secara online. Terinspirasi dari model quick commerce seperti Alphagift dan Astro, platform ini menghubungkan pembeli dengan merchant lokal dan memproses pesanan dengan pengiriman cepat. Target pengguna adalah masyarakat urban Indonesia yang membutuhkan kemudahan belanja kebutuhan harian tanpa harus keluar rumah.

### 1.2 Goals
- Memungkinkan pengguna melakukan pembelian grocery secara online dengan UX yang sederhana dan intuitif
- Menghubungkan merchant/toko lokal dengan pembeli di area yang sama
- Menyediakan sistem manajemen produk, stok, dan pesanan untuk merchant
- Mendukung proses checkout, pembayaran, dan tracking pesanan secara end-to-end

### 1.3 Non-Goals (Out of Scope for v1)
- Fitur live chat antara buyer dan merchant
- Sistem loyalty points / reward program
- Multi-bahasa (hanya Bahasa Indonesia untuk v1)
- Fitur subscription / langganan produk
- Integrasi payment gateway nyata (gunakan mock/sandbox untuk v1)
- Aplikasi mobile native (iOS/Android) — hanya web responsive
- Fitur rekomendasi produk berbasis ML/AI

---

## 2. Users & Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| `Guest` | Pengguna yang belum login | Browse produk, lihat detail produk, lihat merchant |
| `Buyer` | Pengguna terdaftar yang berbelanja | Semua akses Guest + tambah ke keranjang, checkout, lacak pesanan, kelola profil & alamat |
| `Merchant` | Pemilik toko/supplier yang menjual produk | Kelola produk & stok, lihat & proses pesanan masuk, kelola profil toko |
| `Admin` | Pengelola platform | Kelola semua user, merchant approval, kategori produk, monitoring transaksi |

---

## 3. Core Features (MVP)

### Feature 1: Authentication & User Management

**Description:**  
Sistem autentikasi berbasis email + password menggunakan NextAuth.js v5 dengan session strategy. Buyer mendaftar dengan email, nama, dan password. Merchant mendaftar melalui form terpisah dan memerlukan approval dari Admin sebelum bisa berjualan. Setelah login, user diarahkan ke dashboard sesuai role (`/dashboard` untuk buyer, `/merchant/dashboard` untuk merchant, `/admin` untuk admin).

**Acceptance Criteria:**
- [ ] Buyer dapat register dengan email + password, mendapat konfirmasi email
- [ ] Buyer dan Merchant dapat login dengan email + password
- [ ] Session disimpan sebagai HTTP-only cookie, expired setelah 7 hari
- [ ] Merchant baru statusnya `PENDING` sampai di-approve Admin
- [ ] Route `/merchant/*` dan `/admin/*` dilindungi middleware berdasarkan role
- [ ] Buyer dapat update profil (nama, nomor HP, foto profil)
- [ ] Buyer dapat mengelola multiple alamat pengiriman

**Out of Scope:**  
OAuth (Google/Facebook login), OTP via SMS, dan verifikasi email real (gunakan mock confirmation untuk v1).

---

### Feature 2: Product Catalog & Search

**Description:**  
Halaman utama menampilkan produk yang dikelompokkan berdasarkan kategori (Sayuran, Buah, Daging, Minuman, Snack, dll). Pengguna dapat mencari produk berdasarkan nama/keyword, memfilter berdasarkan kategori, dan mengurutkan berdasarkan harga atau popularitas. Setiap produk memiliki halaman detail dengan gambar, deskripsi, harga, stok, dan info merchant.

**Acceptance Criteria:**
- [ ] Halaman beranda menampilkan kategori produk dan produk featured/terbaru
- [ ] Search bar berfungsi dengan query ke database (full-text search PostgreSQL)
- [ ] Filter berdasarkan kategori dapat dikombinasikan dengan search
- [ ] Halaman detail produk menampilkan: nama, gambar (min 1), harga, stok, deskripsi, nama merchant
- [ ] Produk dengan stok `0` ditampilkan sebagai "Habis" dan tidak bisa ditambah ke keranjang
- [ ] Pagination menggunakan infinite scroll atau page-based (min 20 item per halaman)

**Out of Scope:**  
Filter berdasarkan rating, filter berdasarkan jarak merchant, dan fitur "produk serupa".

---

### Feature 3: Shopping Cart & Checkout

**Description:**  
Buyer dapat menambahkan produk dari satu atau lebih merchant ke keranjang. Keranjang disimpan di database (bukan localStorage) agar persisten lintas device. Proses checkout meliputi: pilih alamat pengiriman, konfirmasi pesanan, pilih metode pembayaran (mock: transfer bank / COD), dan submit order. Setelah checkout berhasil, stok produk otomatis berkurang.

**Acceptance Criteria:**
- [ ] Buyer dapat menambah, mengubah jumlah, dan menghapus item dari keranjang
- [ ] Keranjang persisten di database, sinkron saat login dari device berbeda
- [ ] Checkout menampilkan ringkasan: item, subtotal, ongkir (flat Rp 10.000 per merchant), total
- [ ] Buyer harus pilih alamat pengiriman sebelum checkout (redirect ke form alamat jika belum ada)
- [ ] Order dibuat dengan status `PENDING_PAYMENT` setelah submit
- [ ] Stok produk berkurang secara atomic saat order dikonfirmasi (gunakan PostgreSQL transaction)
- [ ] Jika stok tidak cukup saat checkout, tampilkan error dan jangan proses order

**Out of Scope:**  
Integrasi payment gateway real (Midtrans/Xendit), kode promo/voucher, dan kalkulasi ongkir berbasis jarak.

---

### Feature 4: Order Management

**Description:**  
Sistem manajemen pesanan untuk Buyer dan Merchant. Buyer dapat melihat riwayat pesanan dan status terkini. Merchant dapat melihat pesanan masuk dan mengupdate status pesanan. Status flow: `PENDING_PAYMENT` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED` → `CANCELLED`.

**Acceptance Criteria:**
- [ ] Buyer dapat melihat list semua pesanannya dengan status dan tanggal
- [ ] Buyer dapat melihat detail pesanan: item, harga, alamat, status, merchant
- [ ] Merchant dapat melihat pesanan masuk yang ditujukan ke tokonya
- [ ] Merchant dapat mengupdate status pesanan dari `CONFIRMED` ke `PROCESSING` ke `SHIPPED`
- [ ] Buyer dapat membatalkan pesanan selama status masih `PENDING_PAYMENT` atau `CONFIRMED`
- [ ] Perubahan status mengirim notifikasi in-app (toast notification di halaman pesanan)
- [ ] Admin dapat melihat semua pesanan di semua merchant

**Out of Scope:**  
Integrasi kurir real (JNE/Grab/GoSend), tracking nomor resi, dan review/rating pesanan.

---

### Feature 5: Merchant Dashboard & Product Management

**Description:**  
Merchant yang sudah di-approve dapat mengelola toko mereka melalui dashboard khusus. Merchant dapat membuat, mengedit, dan menonaktifkan produk. Setiap produk memiliki nama, deskripsi, harga, stok, kategori, dan gambar (upload via UploadThing).

**Acceptance Criteria:**
- [ ] Merchant dapat melihat ringkasan: total produk, pesanan aktif, total pendapatan (mock)
- [ ] Merchant dapat membuat produk baru dengan form: nama, deskripsi, harga, stok, kategori, gambar
- [ ] Merchant dapat upload 1–5 gambar per produk via UploadThing
- [ ] Merchant dapat mengedit dan menghapus (soft delete) produk miliknya sendiri
- [ ] Merchant dapat mengupdate stok produk secara manual
- [ ] Merchant hanya bisa mengakses produk dan pesanan milik tokonya sendiri (row-level isolation)

**Out of Scope:**  
Analitik penjualan, bulk import produk via CSV, dan fitur promosi/diskon.

---

### Feature 6: Admin Panel

**Description:**  
Panel admin untuk mengelola platform: approve/reject merchant baru, kelola kategori produk, dan monitor transaksi. Admin mengakses panel via route `/admin` yang hanya bisa diakses user dengan role `ADMIN`.

**Acceptance Criteria:**
- [ ] Admin dapat melihat list merchant dengan status `PENDING`, `ACTIVE`, `SUSPENDED`
- [ ] Admin dapat approve atau reject pendaftaran merchant
- [ ] Admin dapat membuat, mengedit, dan menghapus kategori produk
- [ ] Admin dapat melihat semua transaksi/order di seluruh platform
- [ ] Admin dapat suspend/aktifkan akun merchant

**Out of Scope:**  
Dashboard analitik platform (revenue chart, user growth), manajemen banner/iklan, dan sistem refund.

---

## 4. Tech Stack

> **Note for AI agents:** Use exactly these technologies unless explicitly overridden.

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Runtime** | Node.js 22 LTS | |
| **Framework** | Next.js 16 (App Router) | Server Components by default, Turbopack as default bundler |
| **Language** | TypeScript 5 | strict mode enabled |
| **Database** | PostgreSQL 16 | Hosted di Supabase atau Railway |
| **ORM** | Drizzle ORM | Schema di `/drizzle/schema.ts` |
| **Auth** | NextAuth.js v5 (Auth.js) | Strategy: database session, role-based |
| **Styling** | Tailwind CSS v3 + shadcn/ui | Component library dari shadcn |
| **State Management** | TanStack Query (React Query) | Server state; Zustand untuk cart UI state |
| **API Style** | Next.js Route Handlers (REST) | `/app/api/**` |
| **File Storage** | UploadThing v7 | Upload gambar produk, `UPLOADTHING_TOKEN` |
| **Email** | Resend (mock untuk v1) | Konfirmasi registrasi |
| **Deployment** | Vercel | Preview per branch |
| **Package Manager** | pnpm | |
| **Caching** | `cacheComponents: true` | Disabled for MVP (requires Suspense boundaries on all pages). Enable for production optimization. |

---

## 5. Data Models

```typescript
// User
type User = {
  id: string;           // UUID
  name: string;
  email: string;        // unique
  passwordHash: string;
  phone: string | null;
  avatarUrl: string | null;
  role: "BUYER" | "MERCHANT" | "ADMIN";
  createdAt: Date;
  updatedAt: Date;
};

// Address (belongs to User/Buyer)
type Address = {
  id: string;
  userId: string;       // FK → User
  label: string;        // e.g. "Rumah", "Kantor"
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
  createdAt: Date;
};

// Merchant
type Merchant = {
  id: string;
  userId: string;       // FK → User (role: MERCHANT)
  storeName: string;
  description: string | null;
  logoUrl: string | null;
  status: "PENDING" | "ACTIVE" | "SUSPENDED";
  createdAt: Date;
  updatedAt: Date;
};

// Category
type Category = {
  id: string;
  name: string;         // e.g. "Sayuran", "Buah"
  slug: string;         // unique
  iconUrl: string | null;
  createdAt: Date;
};

// Product
type Product = {
  id: string;
  merchantId: string;   // FK → Merchant
  categoryId: string;   // FK → Category
  name: string;
  slug: string;         // unique
  description: string;
  price: number;        // dalam Rupiah (integer, bukan float)
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// ProductImage
type ProductImage = {
  id: string;
  productId: string;    // FK → Product
  url: string;          // UploadThing URL
  order: number;        // urutan tampil (0 = cover)
};

// Cart
type Cart = {
  id: string;
  userId: string;       // FK → User
  createdAt: Date;
  updatedAt: Date;
};

// CartItem
type CartItem = {
  id: string;
  cartId: string;       // FK → Cart
  productId: string;    // FK → Product
  quantity: number;
};

// Order
type Order = {
  id: string;
  userId: string;       // FK → User (buyer)
  merchantId: string;   // FK → Merchant
  addressId: string;    // FK → Address (snapshot saat checkout)
  status: "PENDING_PAYMENT" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  subtotal: number;
  shippingFee: number;  // flat Rp 10.000
  total: number;
  paymentMethod: "BANK_TRANSFER" | "COD";
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// OrderItem
type OrderItem = {
  id: string;
  orderId: string;      // FK → Order
  productId: string;    // FK → Product
  productName: string;  // snapshot nama produk
  productPrice: number; // snapshot harga saat order
  quantity: number;
  subtotal: number;
};
```

---

## 6. API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | public | Register buyer baru |
| `POST` | `/api/auth/register/merchant` | public | Register merchant baru (status: PENDING) |
| `GET` | `/api/products` | public | List produk dengan filter & search |
| `GET` | `/api/products/[slug]` | public | Detail produk by slug |
| `GET` | `/api/categories` | public | List semua kategori |
| `GET` | `/api/merchants/[id]` | public | Detail merchant & produknya |
| `GET` | `/api/cart` | required (BUYER) | Ambil cart user yang login |
| `POST` | `/api/cart/items` | required (BUYER) | Tambah item ke cart |
| `PUT` | `/api/cart/items/[id]` | required (BUYER) | Update quantity cart item |
| `DELETE` | `/api/cart/items/[id]` | required (BUYER) | Hapus item dari cart |
| `POST` | `/api/orders` | required (BUYER) | Buat order baru (checkout) |
| `GET` | `/api/orders` | required (BUYER) | List pesanan buyer |
| `GET` | `/api/orders/[id]` | required | Detail pesanan |
| `PUT` | `/api/orders/[id]/cancel` | required (BUYER) | Batalkan pesanan |
| `GET` | `/api/merchant/orders` | required (MERCHANT) | List pesanan masuk merchant |
| `PUT` | `/api/merchant/orders/[id]/status` | required (MERCHANT) | Update status pesanan |
| `GET` | `/api/merchant/products` | required (MERCHANT) | List produk merchant |
| `POST` | `/api/merchant/products` | required (MERCHANT) | Buat produk baru |
| `PUT` | `/api/merchant/products/[id]` | required (MERCHANT) | Edit produk |
| `DELETE` | `/api/merchant/products/[id]` | required (MERCHANT) | Soft delete produk |
| `GET` | `/api/admin/merchants` | required (ADMIN) | List semua merchant |
| `PUT` | `/api/admin/merchants/[id]/status` | required (ADMIN) | Approve/suspend merchant |
| `GET` | `/api/admin/orders` | required (ADMIN) | List semua order |
| `POST` | `/api/admin/categories` | required (ADMIN) | Buat kategori baru |
| `PUT` | `/api/admin/categories/[id]` | required (ADMIN) | Edit kategori |
| `DELETE` | `/api/admin/categories/[id]` | required (ADMIN) | Hapus kategori |

---

## 7. Next.js 16 — Key Conventions

> **Breaking changes from Next.js 15 → 16:**

| Change | Detail |
|--------|--------|
| **Async Request APIs** | `cookies()`, `headers()`, `draftMode()` must be `await`ed. Synchronous access removed entirely. |
| **params & searchParams** | `params` and `searchParams` in `page.tsx`, `layout.tsx`, `generateMetadata` are now `Promise<>`. Must be `await`ed. |
| **Turbopack default** | No more `--turbopack` flag. Remove from `dev`/`build` scripts. |
| **cacheComponents** | New top-level config in `next.config.ts`: `{ cacheComponents: true }`. Replaces `experimental.staleTimes`, `experimental.ppr`, `experimental.dynamicIO`. |
| **Node.js minimum** | Node.js 20.9.0+ (18 dropped). Project uses 22 LTS — compatible. |
| **TypeScript minimum** | TypeScript 5.1.0+. Project uses 5 — compatible. |

### Upgrade codemod (if migrating from 15)
```bash
pnpm dlx @next/codemod@canary upgrade latest
pnpm dlx @next/codemod@latest next-async-request-api .
```

---

## 8. Project Structure

```
egrocery/
├── app/
│   ├── (public)/                   # Route group: public pages
│   │   ├── page.tsx                # Beranda / homepage
│   │   ├── products/
│   │   │   └── [slug]/page.tsx     # Detail produk
│   │   ├── categories/
│   │   │   └── [slug]/page.tsx     # Produk per kategori
│   │   └── merchants/
│   │       └── [id]/page.tsx       # Halaman toko merchant
│   ├── (auth)/                     # Route group: auth pages
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── register/merchant/page.tsx
│   ├── (buyer)/                    # Route group: protected buyer pages
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── profile/page.tsx
│   ├── merchant/                   # Protected merchant pages
│   │   ├── dashboard/page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   └── orders/page.tsx
│   ├── admin/                      # Protected admin pages
│   │   ├── page.tsx
│   │   ├── merchants/page.tsx
│   │   ├── orders/page.tsx
│   │   └── categories/page.tsx
│   └── api/                        # Route Handlers
│       ├── auth/[...nextauth]/route.ts
│       ├── products/route.ts
│       ├── cart/
│       ├── orders/
│       ├── merchant/
│       └── admin/
├── components/
│   ├── ui/                         # shadcn/ui primitives
│   ├── product/                    # ProductCard, ProductGrid, ProductDetail
│   ├── cart/                       # CartDrawer, CartItem, CartSummary
│   ├── checkout/                   # CheckoutForm, AddressPicker, OrderSummary
│   ├── merchant/                   # ProductForm, OrderTable, MerchantStats
│   └── layout/                     # Navbar, Footer, Sidebar
├── lib/
│   ├── db.ts                       # Drizzle client instance
│   ├── auth.ts                     # NextAuth config
│   ├── uploadthing.ts              # UploadThing config
│   └── utils.ts                    # cn(), formatRupiah(), dll
├── drizzle/
│   ├── schema.ts                   # Semua table definitions
│   └── migrations/                 # Auto-generated migrations
├── hooks/
│   ├── useCart.ts
│   ├── useOrders.ts
│   └── useAuth.ts
├── stores/
│   └── cartStore.ts                # Zustand store untuk cart UI state
├── types/
│   └── index.ts                    # Shared TypeScript types
├── middleware.ts                   # Auth + role-based route protection
├── drizzle.config.ts
└── next.config.ts
```

---

## 9. Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/pasarku

# NextAuth
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# UploadThing
UPLOADTHING_TOKEN=eyJhbGciOi... (v7: base64 JSON: appId + region + apiKey)

# Resend (Email)
RESEND_API_KEY=re_xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 10. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Buyer dapat register hingga selesai | < 2 menit | Manual QA |
| Buyer dapat checkout dari keranjang | < 3 menit | Manual QA |
| Merchant dapat tambah produk baru | < 3 menit | Manual QA |
| Halaman produk (homepage) load time | < 2 detik | Vercel Analytics |
| Tidak ada data loss saat concurrent checkout | 0 race condition | Stress test dengan PostgreSQL transaction |
| Semua route protected sesuai role | 100% | Automated middleware test |

---

## 11. Open Questions

- [ ] Apakah satu order bisa berisi produk dari beberapa merchant sekaligus, atau satu order = satu merchant? (Rekomendasi: satu order per merchant untuk v1, seperti Tokopedia)
- [ ] Ongkir: apakah flat Rp 10.000 per merchant, atau ada variasi? 
- [ ] Apakah perlu fitur search autocomplete / suggestion?
- [ ] Apakah gambar produk dari UploadThing perlu di-resize/compress otomatis (gunakan UploadThing image transformation)?
- [ ] Apakah perlu rate limiting di API endpoint checkout untuk mencegah spam order?

---

*Generated by prd-generator skill — optimized for AI agentic coding tools.*