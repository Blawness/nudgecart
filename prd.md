# PRD: NudgeCart — Smart E-Grocery with Behavioral Nudging

**Version:** 1.0
**Date:** 2026-05-15
**Author:** Vorca Studio (Yudha Hafiz)
**Client:** NudgeCart (skripsi project)
**Status:** Draft
**Base Codebase:** Forked dari Pasarku (Vorca Studio internal project)

---

## 1. Overview

### 1.1 Product Summary

**NudgeCart** adalah aplikasi e-grocery marketplace berbasis Indonesia yang menghubungkan pembeli dengan merchant lokal untuk kebutuhan bahan makanan dan grocery sehari-hari. Yang membedakan NudgeCart dari marketplace biasa adalah **sistem nudge digital berbasis behavioral economics** — intervensi cerdas yang mendorong pengguna ke arah keputusan pembelian yang lebih berkelanjutan (sustainable purchase) tanpa membatasi kebebasan memilih.

NudgeCart dibangun di atas fondasi Pasarku (fullstack e-grocery app by Vorca Studio), dengan penambahan NudgeCart System sebagai differentiator utama.

> **Research context:** NudgeCart System juga berfungsi sebagai implementasi penelitian skripsi dengan variabel: Personalized Level (X1), Timing of Nudges (X2), Nudges Framing (X3), Perceived Usefulness of Nudges (X4), dan Sustainable Purchase Intention (Y).

### 1.2 Goals

- Memungkinkan pengguna belanja grocery online dengan UX yang sederhana dan intuitif
- Menghubungkan merchant lokal dengan pembeli di area yang sama
- Mendorong keputusan pembelian berkelanjutan via nudge digital yang terukur
- Menyediakan infrastruktur logging interaksi nudge sebagai data riset
- Menjadi platform yang scalable untuk dikembangkan pasca-skripsi

### 1.3 Non-Goals (Out of Scope for v1)

- Live chat antara buyer dan merchant
- Sistem loyalty points / reward program
- Multi-bahasa (Bahasa Indonesia only)
- Fitur subscription / langganan produk
- Integrasi payment gateway nyata (mock/sandbox untuk v1)
- Aplikasi mobile native (web responsive only)
- Algoritma rekomendasi berbasis ML/AI real — gunakan rule-based logic
- Real-time personalization engine — preferensi di-query dari DB secara sederhana

---

## 2. Users & Roles

| Role | Deskripsi | Permissions |
|------|-----------|-------------|
| `Guest` | Pengguna belum login | Browse produk, lihat detail produk & merchant |
| `Buyer` | Pengguna terdaftar | Semua Guest + keranjang, checkout, lacak pesanan, profil, alamat, terima nudge |
| `Merchant` | Pemilik toko ter-approve | Kelola produk & stok, proses pesanan, tandai produk eco-friendly |
| `Admin` | Pengelola platform | Semua akses + merchant approval, kategori, monitoring transaksi, nudge analytics |

---

## 3. Core Features (MVP)

### Feature 1: Authentication & User Management

**Description:**
Autentikasi berbasis email + password menggunakan NextAuth.js v5. Buyer dan Merchant mendaftar via form terpisah. Merchant memerlukan approval Admin sebelum bisa berjualan. Setelah Buyer register, diarahkan ke Onboarding Preferensi sebelum masuk beranda.

**Acceptance Criteria:**
- [ ] Buyer dapat register dengan email + password, mendapat konfirmasi email (mock)
- [ ] Buyer dan Merchant dapat login dengan email + password
- [ ] Session disimpan sebagai HTTP-only cookie, expired setelah 7 hari
- [ ] Merchant baru statusnya `PENDING` sampai di-approve Admin
- [ ] Route `/merchant/*` dan `/admin/*` dilindungi middleware berdasarkan role
- [ ] Buyer dapat update profil (nama, nomor HP, foto profil)
- [ ] Buyer dapat mengelola multiple alamat pengiriman
- [ ] Setelah register berhasil, Buyer di-redirect ke `/onboarding` sebelum `/` (beranda)

**Out of Scope:**
OAuth (Google/Facebook), OTP via SMS, verifikasi email real.

---

### Feature 2: Product Catalog & Search

**Description:**
Beranda menampilkan produk per kategori. Buyer dapat search by keyword, filter kategori, sort harga/popularitas. Halaman detail produk menampilkan gambar, deskripsi, harga, stok, info merchant, eco-label, dan social norm data (untuk produk eco-friendly).

**Acceptance Criteria:**
- [ ] Beranda menampilkan kategori + produk featured/terbaru
- [ ] Search bar menggunakan full-text search PostgreSQL
- [ ] Filter kategori dapat dikombinasikan dengan search
- [ ] Detail produk: nama, gambar (min 1), harga, stok, deskripsi, merchant
- [ ] Produk stok `0` ditampilkan "Habis", tidak bisa di-add to cart
- [ ] Pagination: infinite scroll atau page-based (min 20 item/halaman)
- [ ] Produk eco-friendly ditandai badge eco-label (→ Feature 6.5)
- [ ] Detail produk eco-friendly menampilkan social norm data (→ Feature 6.6)
- [ ] Beranda menampilkan seksi rekomendasi personal "Pilihan untuk [Nama]" (→ Feature 6.2)

**Out of Scope:**
Filter by rating, filter by jarak merchant, "produk serupa".

---

### Feature 3: Shopping Cart & Checkout

**Description:**
Buyer menambahkan produk ke keranjang yang persisten di database (bukan localStorage). Checkout meliputi pilih alamat, konfirmasi pesanan, pilih metode pembayaran (mock: transfer bank / COD), dan submit order. Stok berkurang secara atomic via PostgreSQL transaction.

**Acceptance Criteria:**
- [ ] Buyer dapat tambah, ubah quantity, dan hapus item dari keranjang
- [ ] Keranjang persisten di DB, sinkron lintas device
- [ ] Checkout menampilkan: item, subtotal, ongkir (flat Rp 10.000/merchant), total
- [ ] Buyer wajib pilih alamat sebelum checkout
- [ ] Order dibuat dengan status `PENDING_PAYMENT` setelah submit
- [ ] Stok berkurang atomic saat order dikonfirmasi (PostgreSQL transaction)
- [ ] Jika stok tidak cukup saat checkout → error, order tidak diproses
- [ ] Saat add to cart → trigger Just-in-Time Nudge (→ Feature 6.3)
- [ ] Halaman keranjang → Pre-Checkout Nudge (→ Feature 6.4)
- [ ] Halaman checkout → Last-Chance Nudge (→ Feature 6.4)

**Out of Scope:**
Payment gateway real (Midtrans/Xendit), kode promo/voucher, ongkir berbasis jarak.

---

### Feature 4: Order Management

**Description:**
Manajemen pesanan untuk Buyer dan Merchant. Status flow: `PENDING_PAYMENT` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED` → `CANCELLED`.

**Acceptance Criteria:**
- [ ] Buyer melihat list pesanan dengan status dan tanggal
- [ ] Buyer melihat detail pesanan: item, harga, alamat, status, merchant
- [ ] Merchant melihat pesanan masuk ke tokonya
- [ ] Merchant update status: `CONFIRMED` → `PROCESSING` → `SHIPPED`
- [ ] Buyer batalkan pesanan selama status `PENDING_PAYMENT` atau `CONFIRMED`
- [ ] Perubahan status → toast notification di halaman pesanan
- [ ] Admin melihat semua pesanan di semua merchant
- [ ] Halaman konfirmasi order → Post-Purchase Nudge (→ Feature 6.4)

**Out of Scope:**
Integrasi kurir real (JNE/GoSend), tracking resi, review/rating pesanan.

---

### Feature 5: Merchant Dashboard & Product Management

**Description:**
Merchant ter-approve dapat mengelola toko via dashboard: buat, edit, nonaktifkan produk, upload gambar, dan tandai produk sebagai eco-friendly.

**Acceptance Criteria:**
- [ ] Dashboard menampilkan: total produk, pesanan aktif, total pendapatan (mock)
- [ ] Form produk baru: nama, deskripsi, harga, stok, kategori, gambar
- [ ] Upload 1–5 gambar per produk via UploadThing
- [ ] Edit dan soft delete produk milik sendiri
- [ ] Update stok manual
- [ ] Row-level isolation: merchant hanya akses produk & pesanan miliknya
- [ ] Merchant dapat toggle `isEcoFriendly` dan pilih `ecoLabel` type per produk
- [ ] Merchant dapat isi `ecoTooltip` (teks tooltip eco-label) dan `carbonFootprint` (nilai mock)

**Out of Scope:**
Analitik penjualan, bulk import CSV, promosi/diskon.

---

### Feature 6: Admin Panel

**Description:**
Panel admin untuk approve/reject merchant, kelola kategori, monitor transaksi, dan lihat NudgeCart analytics.

**Acceptance Criteria:**
- [ ] List merchant dengan status `PENDING`, `ACTIVE`, `SUSPENDED`
- [ ] Approve atau reject pendaftaran merchant
- [ ] CRUD kategori produk
- [ ] Lihat semua transaksi/order seluruh platform
- [ ] Suspend/aktifkan akun merchant
- [ ] Halaman nudge analytics: total nudge ditampilkan, acceptance rate per jenis nudge, eco-purchase count

**Out of Scope:**
Revenue chart platform, manajemen banner/iklan, sistem refund.

---

## 4. NudgeCart System (Feature 6 — Core Differentiator)

> Semua fitur di bagian ini adalah implementasi variabel penelitian.
> Tag `[X1]`, `[X2]`, `[X3]`, `[X4]` digunakan dalam komentar kode untuk traceability ke instrumen penelitian.

---

### Feature 6.1: Onboarding Preferensi `[X1]`

**Description:**
Setelah register, Buyer melewati onboarding preferensi 3–5 langkah untuk mengumpulkan data awal personalisasi sebagai seed rekomendasi produk.

**Acceptance Criteria:**
- [ ] Muncul setelah register berhasil, sebelum redirect ke beranda (`/onboarding`)
- [ ] Maksimal 5 langkah, 1 pertanyaan per langkah dengan pilihan visual (ikon + teks)
- [ ] Pertanyaan: (1) kategori produk favorit, (2) preferensi gaya hidup (`HEMAT` / `SEHAT` / `ECO`), (3) frekuensi belanja
- [ ] Tombol "Lewati" di kanan atas, ukuran lebih kecil dari tombol utama
- [ ] Skip → simpan event `ONBOARDING_SKIPPED` di `UserPreference`
- [ ] Data disimpan ke `UserPreference`
- [ ] Micro-copy: *"Preferensi ini membantu kami menampilkan produk yang paling relevan untuk kamu."*
- [ ] Preferensi otomatis diperbarui setelah minimal 3 transaksi (rule-based)

**UI Spec:**
- Format: step progress bar (maks. 5 langkah)
- Setiap step: 1 pertanyaan + pilihan visual
- Background bersih, tidak ada elemen beranda yang terlihat

**Out of Scope:**
Halaman settings preferensi post-onboarding (v1), ML-based preference update.

---

### Feature 6.2: Rekomendasi Produk Personal `[X1]`

**Description:**
Beranda menampilkan seksi rekomendasi yang disesuaikan dengan preferensi dan riwayat pembelian Buyer. Halaman detail produk menampilkan alternatif lebih hemat atau eco-friendly.

**Acceptance Criteria:**
- [ ] Beranda: seksi `"Pilihan untuk [Nama Pengguna]"` berisi 6–10 produk
- [ ] Logika prioritas (rule-based):
  - Produk dalam kategori favorit dari `UserPreference`
  - Produk yang dibeli lebih dari 1× dalam 30 hari terakhir
  - Fallback: produk featured dari kategori favorit onboarding
- [ ] Beranda: seksi `"Produk Ramah Lingkungan Untukmu"` — produk eco-friendly dari kategori favorit
- [ ] Label di bawah produk: *"Berdasarkan riwayat belanjaanmu"* atau *"Sesuai preferensi kamu"*
- [ ] Detail produk: blok `"Alternatif Pilihan"` maks. 3 produk (lebih hemat / lebih eco)

**UI Spec:**
- Seksi rekomendasi: horizontal scroll card di beranda
- Label: `text-muted-foreground`, font kecil
- Produk eco-friendly: badge 🌿 di sudut kiri atas kartu

**Out of Scope:**
Collaborative filtering, A/B testing algoritma rekomendasi.

---

### Feature 6.3: Promo Personal `[X1]`

**Description:**
Banner promo di beranda dipersonalisasi berdasarkan kategori paling sering dibeli, bukan promo generik.

**Acceptance Criteria:**
- [ ] Banner promo personal di posisi pertama carousel beranda
- [ ] Konten: *"Hai [Nama], stok [produk favorit] kamu hampir habis. Dapatkan diskon 10% hari ini!"* (mock)
- [ ] Label *"Khusus untukmu"* di pojok kiri atas banner
- [ ] Klik banner → catat event `PROMO_PERSONAL_CLICK` ke `NudgeLog`
- [ ] Fallback: banner promo generik jika belum ada riwayat pembelian

**UI Spec:**
- Posisi pertama carousel beranda
- Nama pengguna di headline
- Border warna primer (`border-primary`) untuk membedakan dari promo umum

**Out of Scope:**
Diskon real, promo bundle dinamis.

---

### Feature 6.4: Timing of Nudges — Display System `[X2]`

> **Aturan global timing (dikelola `NudgeEngine` di `lib/nudge-engine.ts`):**
> - Maks. **1 nudge pop-up** per sesi belanja aktif
> - Push notification maks. **1×/hari** per Buyer
> - Nudge yang sama tidak muncul lebih dari **2× dalam 7 hari**
> - Jika Buyer dismiss nudge → tidak tampil lagi selama **24 jam**

#### 6.4.1 Just-in-Time Nudge — Add to Cart `[X2]`

**Description:**
Ketika Buyer menambahkan produk ke keranjang, sistem mendeteksi apakah ada alternatif eco-friendly atau lebih hemat. Jika ada dan aturan timing terpenuhi, tampilkan `NudgeBottomSheet`.

**Acceptance Criteria:**
- [ ] Trigger: Buyer klik "Tambah ke Keranjang"
- [ ] Query: produk alternatif dengan `isEcoFriendly: true` atau harga lebih rendah di kategori sama
- [ ] Jika ada alternatif + timing OK → tampilkan `NudgeBottomSheet`
- [ ] `NudgeBottomSheet` berisi: foto alternatif, label keunggulan, tombol **"Ganti Produk"** dan **"Tetap Pilihan Ini"**
- [ ] "Ganti Produk" → ganti item di keranjang + catat `NUDGE_ACCEPTED` ke `NudgeLog`
- [ ] "Tetap Pilihan Ini" atau abaikan → catat `NUDGE_DISMISSED` ke `NudgeLog`
- [ ] Auto-dismiss setelah 5 detik tanpa interaksi

**UI Spec:**
- Bottom sheet slide-up dari bawah (300ms ease-in-out), tinggi ±30% layar
- Layout: foto produk (kiri) + teks keunggulan (kanan) + 2 tombol bawah
- Timer visual: progress bar tipis di atas card (opsional)
- Background: `bg-green-50` untuk nudge eco-friendly

#### 6.4.2 Pre-Checkout Nudge — Halaman Keranjang `[X2]`

**Description:**
Di halaman `/cart`, sistem memilih satu nudge paling relevan dan menampilkannya sebagai inline banner di atas tombol "Checkout".

**Acceptance Criteria:**
- [ ] Trigger: Buyer buka halaman `/cart`
- [ ] Sistem memilih satu nudge (prioritas urutan):
  1. *"Tambahkan 1 produk ramah lingkungan untuk melengkapi belanjaanmu."* — jika tidak ada produk eco di keranjang
  2. *"Tambahkan Rp X lagi untuk gratis ongkir!"* — jika mendekati threshold (mock: Rp 50.000)
  3. *"Produk favoritmu sering dibeli bersama [produk X], mau ditambahkan?"* — bundle
- [ ] Inline banner, bukan pop-up
- [ ] Buyer dapat tutup dengan ikon × → catat `NUDGE_DISMISSED`
- [ ] Klik CTA → catat `NUDGE_ACCEPTED`

**UI Spec:**
- Banner height ±60–70px, di atas tombol "Checkout"
- Layout: ikon kiri + teks tengah + tombol aksi kecil kanan
- Background: `bg-green-50` atau `bg-blue-50`
- Satu kata kunci **bold** dalam teks

#### 6.4.3 Last-Chance Nudge — Halaman Checkout `[X2]`

**Description:**
Di halaman `/checkout`, tampilkan blok nudge statis berisi sustainability impact dan notifikasi versi eco-friendly tersedia.

**Acceptance Criteria:**
- [ ] Blok sustainability info di bawah ringkasan pesanan: *"Dengan belanja produk ini, kamu berkontribusi mengurangi 0,3 kg emisi karbon."* (nilai dari `product.carbonFootprint`, default mock)
- [ ] Jika ada produk konvensional yang punya versi eco: *"Versi ramah lingkungan tersedia untuk [produk X]."*
- [ ] Nudge statis (bukan pop-up/modal)
- [ ] Setiap render checkout → catat `NUDGE_DISPLAYED` ke `NudgeLog`

**UI Spec:**
- Posisi: antara ringkasan produk dan tombol "Bayar Sekarang"
- Ikon 🌿 atau 🌍 di kiri teks
- Maks. 2 baris teks

#### 6.4.4 Post-Purchase Nudge — Konfirmasi Order `[X2]`

**Description:**
Setelah order berhasil, halaman konfirmasi menampilkan apresiasi sustainability dan rekomendasi eco produk berikutnya.

**Acceptance Criteria:**
- [ ] Jika order mengandung produk eco: *"Terima kasih! Dengan memilih [produk], kamu telah berkontribusi untuk lingkungan yang lebih baik."*
- [ ] Impact counter: *"Ini pembelian ramah lingkungan ke-[N] kamu bulan ini!"* (hitung dari `NudgeLog` event `ECO_PURCHASE`)
- [ ] Tampilkan 2–3 rekomendasi produk eco terkait
- [ ] Catat event `ECO_PURCHASE` ke `NudgeLog`

**UI Spec:**
- Confetti kecil warna hijau saat halaman load (jika eco-purchase)
- Impact counter: badge / milestone card
- Warna dominan: hijau muda + putih

**Out of Scope (semua timing nudge):**
Push notification real, nudge berbasis lokasi, A/B testing timing.

---

### Feature 6.5: Eco-Label System `[X3]`

**Description:**
Produk eco-friendly mendapat badge visual (eco-label) di listing dan halaman detail. Tiga jenis label merepresentasikan framing berbeda.

**Acceptance Criteria:**
- [ ] Merchant dapat pilih eco-label saat buat/edit produk
- [ ] Tiga jenis label:

| Label | Enum | Ikon | Warna | Framing |
|-------|------|------|-------|---------|
| Produk Segar | `FRESH` | 🌿 | `#4CAF50` | Gain |
| Pilihan Hemat & Fresh | `ECONOMICAL` | 💚 | `#4CAF50` | Gain |
| Pilihan Terpopuler | `POPULAR` | 🏆 | `#5C6BC0` | Social Norm |

- [ ] Badge muncul di kartu produk (listing) dan halaman detail
- [ ] Tooltip popover saat label diklik/tap, konten dari `product.ecoTooltip`

**UI Spec:**
- Badge kecil di sudut kiri atas kartu, tidak menghalangi gambar
- Tooltip: fade-in 200ms, maks. 2 kalimat

**Out of Scope:**
Verifikasi eco-claim third-party, sertifikasi otomatis.

---

### Feature 6.6: Social Norm Framing `[X3]`

**Description:**
Halaman detail produk eco-friendly menampilkan data sosial (mock) sebagai referensi norma sosial untuk mempengaruhi keputusan pembelian.

**Acceptance Criteria:**
- [ ] Hanya tampil di produk dengan `isEcoFriendly: true`
- [ ] Dua variasi teks (pilih berdasarkan `product.socialNormType`):
  - `WEEKLY_BUYERS`: *"⭐ Dipilih oleh 1.240 pengguna minggu ini."*
  - `LOCAL_BUYERS`: *"🔥 87 orang di sekitarmu membeli produk ini bulan lalu."*
- [ ] Data bersifat mock/static
- [ ] Posisi: di bawah nama produk atau di atas tombol "Tambah ke Keranjang"

**UI Spec:**
- Teks kecil, warna `text-muted-foreground`
- Ikon orang / bintang di kiri teks

**Out of Scope:**
Social norm real-time, social norm untuk produk non-eco.

---

### Feature 6.7: Gain vs Loss Framing `[X3]`

**Description:**
Teks nudge menggunakan framing berbeda sesuai konteks — gain framing (keuntungan) untuk beranda & detail produk, loss framing (kerugian) untuk keranjang & pre-checkout.

**Framing Matrix:**

| Konteks | Framing | Contoh Teks |
|---------|---------|-------------|
| `HOME` / `PRODUCT_DETAIL` | Gain | *"Pilih produk ini dan hemat Rp5.000 sekaligus jaga lingkungan!"* |
| `CART` / `CHECKOUT` | Loss | *"Tanpa pilihan ini, kamu melewatkan kesempatan mengurangi 0,5 kg food loss."* |
| `POST_PURCHASE` | Gain | *"Kamu sudah berkontribusi mengurangi 0,3 kg emisi karbon!"* |

**Acceptance Criteria:**
- [ ] `NudgeEngine` menentukan framing berdasarkan `nudgeContext`
- [ ] Teks nudge diambil dari `nudgeTemplates` sesuai framing + konteks
- [ ] `NudgeLog` mencatat `framingType` (`GAIN` / `LOSS`) di setiap nudge

**Out of Scope:**
A/B testing framing per user segment, dynamic copywriting berbasis LLM.

---

### Feature 6.8: Nudge Feedback — Mini Survey `[X4]`

**Description:**
Setelah 3 kali interaksi nudge dalam satu sesi, sistem menampilkan pertanyaan rating opsional untuk mengukur perceived usefulness of nudges.

**Acceptance Criteria:**
- [ ] Trigger: setelah 3 event nudge (`NUDGE_DISPLAYED` / `NUDGE_ACCEPTED` / `NUDGE_DISMISSED`) dalam satu sesi
- [ ] Pertanyaan: *"Apakah saran produk tadi membantu keputusan belanjaanmu?"* (bintang 1–5)
- [ ] Snackbar di bawah layar, height ±50px
- [ ] Opsional — tutup dengan 1 tap
- [ ] Muncul hanya sekali per sesi
- [ ] Response disimpan ke `NudgeFeedback`

**UI Spec:**
- Snackbar posisi bottom, tidak memblokir konten
- 5 bintang interaktif
- Tombol × untuk dismiss

**Out of Scope:**
Multi-pertanyaan survey, feedback per nudge spesifik.

---

## 5. Tech Stack

> **Note for AI agents:** Gunakan stack ini secara eksak kecuali ada override eksplisit.

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Runtime** | Node.js 22 LTS | |
| **Framework** | Next.js 16 (App Router) | Server Components default, Turbopack default bundler |
| **Language** | TypeScript 5 | strict mode enabled |
| **Database** | PostgreSQL 16 | Hosted di Supabase atau Railway |
| **ORM** | Drizzle ORM | Schema di `/drizzle/schema.ts` |
| **Auth** | NextAuth.js v5 (Auth.js) | Database session strategy, role-based |
| **Styling** | Tailwind CSS v3 + shadcn/ui | |
| **State Management** | TanStack Query | Server state; Zustand untuk cart + nudge session state |
| **API Style** | Next.js Route Handlers (REST) | `/app/api/**` |
| **File Storage** | UploadThing v7 | Gambar produk, `UPLOADTHING_TOKEN` |
| **Email** | Resend (mock v1) | Konfirmasi registrasi |
| **Animation** | Framer Motion | Nudge bottom sheet, post-purchase confetti |
| **Deployment** | Vercel | Preview per branch |
| **Package Manager** | pnpm | |
| **NudgeEngine** | Custom lib `lib/nudge-engine.ts` | Rule-based timing + framing logic, bukan ML |

---

## 6. Data Models

```typescript
// ─── CORE MODELS ──────────────────────────────────────────────

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

type Address = {
  id: string;
  userId: string;
  label: string;        // "Rumah", "Kantor"
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
  createdAt: Date;
};

type Merchant = {
  id: string;
  userId: string;
  storeName: string;
  description: string | null;
  logoUrl: string | null;
  status: "PENDING" | "ACTIVE" | "SUSPENDED";
  createdAt: Date;
  updatedAt: Date;
};

type Category = {
  id: string;
  name: string;
  slug: string;         // unique
  iconUrl: string | null;
  createdAt: Date;
};

type Product = {
  id: string;
  merchantId: string;
  categoryId: string;
  name: string;
  slug: string;         // unique
  description: string;
  price: number;        // Rupiah, integer
  stock: number;
  isActive: boolean;
  // ── NudgeCart fields [X1, X3] ──
  isEcoFriendly: boolean;
  ecoLabel: "FRESH" | "ECONOMICAL" | "POPULAR" | null;
  ecoTooltip: string | null;
  socialNormType: "WEEKLY_BUYERS" | "LOCAL_BUYERS" | null;
  carbonFootprint: number | null;   // kg CO₂, mock value
  createdAt: Date;
  updatedAt: Date;
};

type ProductImage = {
  id: string;
  productId: string;
  url: string;          // UploadThing URL
  order: number;        // 0 = cover
};

type Cart = {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

type CartItem = {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
};

type Order = {
  id: string;
  userId: string;
  merchantId: string;
  addressId: string;
  status: "PENDING_PAYMENT" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  subtotal: number;
  shippingFee: number;  // flat Rp 10.000
  total: number;
  paymentMethod: "BANK_TRANSFER" | "COD";
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  productName: string;  // snapshot
  productPrice: number; // snapshot
  quantity: number;
  subtotal: number;
};

// ─── NUDGECART MODELS ─────────────────────────────────────────

// [X1] Preferensi dari onboarding
type UserPreference = {
  id: string;
  userId: string;                   // FK → User, unique (1-to-1)
  favoriteCategories: string[];     // array of Category.id
  lifestyleType: "HEMAT" | "SEHAT" | "ECO" | null;
  shoppingFrequency: "HARIAN" | "MINGGUAN" | "BULANAN" | null;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// [X2, X3] Log setiap nudge event
type NudgeLog = {
  id: string;
  userId: string;
  sessionId: string;                // UUID per session
  nudgeType:
    | "JUST_IN_TIME"                // add to cart
    | "PRE_CHECKOUT"                // halaman keranjang
    | "LAST_CHANCE"                 // halaman checkout
    | "POST_PURCHASE"               // konfirmasi order
    | "PROMO_PERSONAL"              // banner promo
    | "RECOMMENDATION";             // rekomendasi beranda
  framingType: "GAIN" | "LOSS" | "SOCIAL_NORM" | null;   // [X3]
  nudgeContext: "HOME" | "PRODUCT_DETAIL" | "CART" | "CHECKOUT" | "POST_PURCHASE";
  productId: string | null;
  alternativeProductId: string | null;
  event:
    | "NUDGE_DISPLAYED"
    | "NUDGE_ACCEPTED"
    | "NUDGE_DISMISSED"
    | "ECO_PURCHASE"
    | "PROMO_PERSONAL_CLICK";
  createdAt: Date;
};

// [X4] Feedback perceived usefulness
type NudgeFeedback = {
  id: string;
  userId: string;
  sessionId: string;
  rating: number;       // 1–5
  createdAt: Date;
};
```

---

## 7. API Endpoints

### Core Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | public | Register Buyer baru |
| `POST` | `/api/auth/register/merchant` | public | Register Merchant (status: PENDING) |
| `GET` | `/api/products` | public | List produk + filter + search |
| `GET` | `/api/products/[slug]` | public | Detail produk by slug |
| `GET` | `/api/categories` | public | List semua kategori |
| `GET` | `/api/merchants/[id]` | public | Detail merchant + produknya |
| `GET` | `/api/cart` | BUYER | Ambil cart |
| `POST` | `/api/cart/items` | BUYER | Tambah item ke cart |
| `PUT` | `/api/cart/items/[id]` | BUYER | Update quantity |
| `DELETE` | `/api/cart/items/[id]` | BUYER | Hapus item |
| `POST` | `/api/orders` | BUYER | Buat order (checkout) |
| `GET` | `/api/orders` | BUYER | List pesanan |
| `GET` | `/api/orders/[id]` | BUYER/MERCHANT | Detail pesanan |
| `PUT` | `/api/orders/[id]/cancel` | BUYER | Batalkan pesanan |
| `GET` | `/api/merchant/orders` | MERCHANT | Pesanan masuk merchant |
| `PUT` | `/api/merchant/orders/[id]/status` | MERCHANT | Update status pesanan |
| `GET` | `/api/merchant/products` | MERCHANT | List produk merchant |
| `POST` | `/api/merchant/products` | MERCHANT | Buat produk baru |
| `PUT` | `/api/merchant/products/[id]` | MERCHANT | Edit produk |
| `DELETE` | `/api/merchant/products/[id]` | MERCHANT | Soft delete produk |
| `GET` | `/api/admin/merchants` | ADMIN | List semua merchant |
| `PUT` | `/api/admin/merchants/[id]/status` | ADMIN | Approve/suspend merchant |
| `GET` | `/api/admin/orders` | ADMIN | List semua order |
| `POST` | `/api/admin/categories` | ADMIN | Buat kategori |
| `PUT` | `/api/admin/categories/[id]` | ADMIN | Edit kategori |
| `DELETE` | `/api/admin/categories/[id]` | ADMIN | Hapus kategori |

### NudgeCart Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/nudge/preference` | BUYER | Ambil `UserPreference` |
| `POST` | `/api/nudge/preference` | BUYER | Simpan/update preferensi onboarding |
| `GET` | `/api/nudge/recommendations` | BUYER | Rekomendasi produk personal (rule-based) |
| `POST` | `/api/nudge/evaluate` | BUYER | Evaluasi nudge yang harus tampil (context + timing rules) |
| `POST` | `/api/nudge/log` | BUYER | Catat nudge event ke `NudgeLog` |
| `GET` | `/api/nudge/log` | BUYER | History nudge user (untuk impact counter) |
| `POST` | `/api/nudge/feedback` | BUYER | Simpan feedback rating `[X4]` |
| `GET` | `/api/admin/nudge/analytics` | ADMIN | Stats: displayed count, acceptance rate per type |

---

## 8. NudgeEngine — Implementation Spec

**File:** `lib/nudge-engine.ts`

```typescript
type NudgeContext = "HOME" | "PRODUCT_DETAIL" | "CART" | "CHECKOUT" | "POST_PURCHASE";

type NudgeDecision = {
  shouldShow: boolean;
  nudgeType: NudgeType | null;
  framingType: "GAIN" | "LOSS" | "SOCIAL_NORM" | null;
  content: {
    headline: string;
    body: string;
    ctaText: string;
    alternativeProduct?: Product;
  } | null;
};

// Fungsi utama — dipanggil sebelum render nudge apapun
export async function evaluateNudge(params: {
  userId: string;
  sessionId: string;
  context: NudgeContext;
  cartItems?: CartItem[];
  productId?: string;
}): Promise<NudgeDecision>

// Timing rules yang dicek di dalam evaluateNudge:
// 1. Apakah user dalam cooldown 24 jam (sejak NUDGE_DISMISSED terakhir)?
// 2. Apakah nudge type ini sudah muncul 2× dalam 7 hari?
// 3. Apakah sudah ada nudge pop-up di sesi ini? (maks. 1 per sesi)
// 4. Tentukan framing: GAIN jika context HOME/PRODUCT_DETAIL, LOSS jika CART/CHECKOUT
// 5. Return NudgeDecision
```

**Nudge Session State (Zustand — `stores/nudgeStore.ts`):**
```typescript
type NudgeStore = {
  sessionId: string;              // UUID, di-generate saat pertama load
  popupShownThisSession: boolean; // max 1 pop-up per session
  nudgeInteractionCount: number;  // counter untuk trigger feedback survey (X4)
  setPopupShown: () => void;
  incrementInteraction: () => void;
};
```

---

## 9. Next.js 16 — Key Conventions

| Change | Detail |
|--------|--------|
| **Async Request APIs** | `cookies()`, `headers()`, `draftMode()` harus di-`await` |
| **params & searchParams** | Harus di-`await` di `page.tsx`, `layout.tsx`, `generateMetadata` |
| **Turbopack default** | Hapus flag `--turbopack` dari scripts |
| **cacheComponents** | Config di `next.config.ts` — disable untuk MVP |
| **Node.js minimum** | Node.js 20.9.0+ (project uses 22 LTS ✅) |
| **TypeScript minimum** | TypeScript 5.1.0+ (project uses 5 ✅) |

---

## 10. Project Structure

```
nudgecart/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                        # Beranda + rekomendasi personal + promo personal
│   │   ├── products/[slug]/page.tsx         # Detail + eco-label + social norm + alternatif
│   │   ├── categories/[slug]/page.tsx
│   │   └── merchants/[id]/page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── register/merchant/page.tsx
│   ├── (buyer)/
│   │   ├── onboarding/page.tsx              # [X1] Onboarding preferensi post-register
│   │   ├── cart/page.tsx                    # Cart + Pre-Checkout Nudge [X2]
│   │   ├── checkout/page.tsx                # Checkout + Last-Chance Nudge [X2]
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx               # Konfirmasi + Post-Purchase Nudge [X2]
│   │   └── profile/page.tsx
│   ├── merchant/
│   │   ├── dashboard/page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx                # Form produk + eco-friendly toggle + eco-label
│   │   │   └── [id]/edit/page.tsx
│   │   └── orders/page.tsx
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── merchants/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── categories/page.tsx
│   │   └── nudge/page.tsx                  # [X4] NudgeCart analytics dashboard
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── products/route.ts
│       ├── cart/
│       ├── orders/
│       ├── merchant/
│       ├── admin/
│       └── nudge/
│           ├── preference/route.ts
│           ├── recommendations/route.ts
│           ├── evaluate/route.ts
│           ├── log/route.ts
│           ├── feedback/route.ts
│           └── analytics/route.ts          # admin only
├── components/
│   ├── ui/                                 # shadcn/ui primitives
│   ├── product/                            # ProductCard, ProductGrid, ProductDetail
│   ├── cart/                               # CartDrawer, CartItem, CartSummary
│   ├── checkout/                           # CheckoutForm, AddressPicker, OrderSummary
│   ├── merchant/                           # ProductForm, OrderTable, MerchantStats
│   ├── layout/                             # Navbar, Footer, Sidebar
│   └── nudge/                              # NudgeCart components
│       ├── NudgeBottomSheet.tsx            # [X2] Just-in-time (add to cart)
│       ├── NudgeInlineBanner.tsx           # [X2] Pre-checkout (cart page)
│       ├── NudgeStaticBlock.tsx            # [X2] Last-chance (checkout)
│       ├── NudgePostPurchase.tsx           # [X2] Post-purchase
│       ├── NudgeFeedbackSnackbar.tsx       # [X4] Mini survey
│       ├── EcoLabel.tsx                    # [X3] Badge + tooltip
│       ├── SocialNormBadge.tsx             # [X3] Social proof text
│       ├── PersonalPromoBanner.tsx         # [X1] Banner promo personal
│       └── RecommendationSection.tsx       # [X1] Seksi rekomendasi beranda
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   ├── uploadthing.ts
│   ├── utils.ts
│   └── nudge-engine.ts                     # NudgeCart timing + framing logic
├── drizzle/
│   ├── schema.ts
│   └── migrations/
├── hooks/
│   ├── useCart.ts
│   ├── useOrders.ts
│   ├── useAuth.ts
│   └── useNudge.ts                         # Nudge state + logging hook
├── stores/
│   ├── cartStore.ts
│   └── nudgeStore.ts                       # Zustand: session nudge state
├── types/
│   └── index.ts
├── middleware.ts
├── drizzle.config.ts
└── next.config.ts
```

---

## 11. Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/nudgecart

# NextAuth
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# UploadThing
UPLOADTHING_TOKEN=eyJhbGciOi...

# Resend
RESEND_API_KEY=re_xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 12. Success Metrics

### Functional
| Metric | Target | Cara Ukur |
|--------|--------|-----------|
| Register + onboarding selesai | < 3 menit | Manual QA |
| Checkout dari keranjang | < 3 menit | Manual QA |
| Merchant tambah produk + eco-label | < 3 menit | Manual QA |
| Halaman produk load time | < 2 detik | Vercel Analytics |
| Concurrent checkout tanpa race condition | 0 error | Stress test |
| Semua route protected by role | 100% | Middleware test |

### NudgeCart Research
| Metric | Target | Cara Ukur |
|--------|--------|-----------|
| `NudgeLog` tercatat tiap nudge event | 100% | DB query |
| Maks. 1 pop-up nudge per sesi | 0 violation | Log audit |
| `NudgeFeedback` tersimpan saat submit | 100% | Manual test |
| Admin dapat lihat acceptance rate per nudge type | ✅ | Admin panel |
| `framingType` tercatat di setiap `NudgeLog` | 100% | DB schema check |
| Data `NudgeLog` exportable untuk analisis penelitian | ✅ | Admin panel / CSV export |

---

## 13. Open Questions

- [ ] Threshold gratis ongkir untuk Pre-Checkout Nudge: Rp 50.000 atau nilai lain?
- [ ] Nilai `carbonFootprint` per produk: perlu simulasi realistik atau cukup static mock?
- [ ] Apakah `NudgeLog` perlu fitur export CSV untuk keperluan analisis data skripsi?
- [ ] Apakah Buyer bisa opt-out dari nudge (settings)? Jika ya, perlu field `nudgeOptOut` di `User`
- [ ] Framing apa yang dipakai jika semua item di keranjang sudah eco-friendly?
- [ ] Satu order bisa lintas merchant, atau satu order = satu merchant? (Rekomendasi: satu merchant per order untuk v1)
- [ ] Nama domain/slug deployment: `nudgecart.vercel.app`?

---

## 14. Development Notes — Fork dari Pasarku

> Untuk developer (Vorca Studio):

**Yang diubah dari Pasarku:**
- Semua string `"Pasarku"` → `"NudgeCart"` (nama app, metadata, DB name)
- Tambah field NudgeCart ke model `Product` di `drizzle/schema.ts`
- Tambah tabel `UserPreference`, `NudgeLog`, `NudgeFeedback`
- Tambah folder `components/nudge/` (9 komponen baru)
- Tambah `lib/nudge-engine.ts`
- Tambah `stores/nudgeStore.ts`
- Tambah `hooks/useNudge.ts`
- Tambah route `/api/nudge/*` (8 endpoints)
- Tambah halaman `/onboarding` dan `/admin/nudge`
- Update form produk merchant: tambah eco-friendly fields
- Install: `framer-motion`

**Yang tidak berubah:**
- Auth flow, cart logic, order management, merchant dashboard core, admin panel core

---

*PRD v1.0 — NudgeCart by Vorca Studio*
*Built on Pasarku foundation — optimized for AI agentic coding tools (Claude Code, Cursor, Codex)*
