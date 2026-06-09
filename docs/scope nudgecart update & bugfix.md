# SCOPE — NudgeCart: Feature Update & Bugfix

**Version:** 1.0
**Date:** 2026-06-09
**Project:** NudgeCart (klien: Ramdhan)
**Source:** Feedback klien — "Update Fitur Berdasarkan Digital Nudging" + "Laporan Bug"
**Reference app:** Alfagift (grocery e-commerce) untuk pola UI keranjang, akun, promo
**Status:** Ready for implementation

> **Catatan untuk AI agent:** Dokumen ini berisi **perubahan pada app yang sudah jalan**, bukan build dari nol. Banyak halaman & desain sudah ada dan dianggap cukup bagus oleh klien — hanya tambahkan/perbaiki bagian yang disebut di sini. Jangan refactor di luar scope.

---

## 0. Route Map (current → target)

| Route | Status sekarang | Target |
|-------|-----------------|--------|
| `/` (Home) | Ada | Tambah section personalisasi (FEAT-1) |
| `/onboarding` | **Belum ada** | Buat baru — preference picker (FEAT-1) |
| `/promo` | **404 / blank** | Build penuh (BUG-5) |
| `/cart` (Keranjang) | Ada | Tambah default promo + gain framing (FEAT-2) |
| `/checkout` | Ada | Tambah savings badge + food-loss popup (FEAT-2) |
| `/account` (Akun) | Blank / kurang konten | Build sesuai pola Alfagift (BUG-4) |
| `/brand` | Ada (404 saat dibuka) | **Hapus** (BUG-1) |

> Sesuaikan nama route dengan konvensi repo existing kalau beda (`/keranjang`, `/akun`, dll). Yang penting struktur navigasinya, bukan slug-nya.

---

## 1. FEATURE UPDATES (Digital Nudging)

### FEAT-1: Perceived Personalization

**Konteks:** Personalisasi berbasis preferensi user untuk menyusun ulang tampilan Home.

#### 1a. Onboarding Preference Picker (route baru)

**Description:**
User baru, saat pertama masuk, dihadapkan satu/lebih langkah onboarding yang menanyakan **kategori produk yang paling sering dibeli**. Jawaban disimpan dan dipakai untuk menyusun konten Home.

- Pertanyaan: *"Kategori Produk apa yang paling Sering Kamu Beli?"* (sub: "Pilih yang paling sesuai")
- Opsi (multi-select): `Sayuran & Telur`, `Buah-Buahan`, `Kebutuhan Rumah Tangga`, `Lainnya`
- Ada progress bar di atas + tombol **Lewati** (skip) di pojok kanan
- Tombol **Lanjut** menyimpan preferensi → redirect ke Home
- Helper text: *"Preferensi ini membantu kami menampilkan produk yang paling relevan untuk kamu"*

**Acceptance Criteria:**
- [ ] User baru (belum punya `preferences`) otomatis diarahkan ke `/onboarding` setelah signup/first login
- [ ] User existing yang sudah punya preferensi **tidak** melihat onboarding lagi
- [ ] Tombol **Lewati** menyimpan `preferences = []` (atau flag `onboardingSkipped`) dan tetap lanjut ke Home (Home fallback ke konten default)
- [ ] Pilihan tersimpan ke DB per user, persist lintas sesi
- [ ] `prefers-reduced-motion` dihormati untuk animasi progress bar

**Out of Scope:**
- Tidak ada step onboarding lain di luar preference picker (no alamat, no payment setup)
- Tidak ada algoritma rekomendasi ML — cukup filter/sort berdasarkan kategori yang dipilih

#### 1b. Nudge Personalization di Home

**Description:**
Home menampilkan dua section yang dipersonalisasi dari jawaban onboarding, dengan urutan dari atas:

1. **Produk Pilihan** — grid produk yang kategorinya cocok dengan preferensi user
2. **Promo Pilihan** (tepat di bawah Produk Pilihan) — kartu promo berisi **bundling** produk yang sesuai preferensi, dengan harga yang sudah didiskon

**Acceptance Criteria:**
- [ ] Section "Produk Pilihan" memfilter produk berdasarkan kategori preferensi user
- [ ] Section "Promo Pilihan" muncul **di bawah** "Produk Pilihan"
- [ ] Promo Pilihan menampilkan bundling produk yang match preferensi, dengan harga promo
- [ ] Kalau user skip onboarding / preferensi kosong → tampilkan konten default (produk & promo umum), tidak crash/blank

**Out of Scope:**
- Banner & search bar existing tidak diubah
- Tidak perlu real-time re-ranking; cukup di-load saat render Home

#### 1c. Gain-Loss Framing pada Kartu Promo Pilihan

**Description:**
Setiap kartu promo pakai label framing manfaat. Dua varian badge:

- **Badge `BEST DEAL`** (ribbon, pojok kiri-atas kartu)
- **Label `Lebih Hemat Rp.xx`** (ribbon, pojok kanan-atas kartu) — `xx` = selisih harga normal vs harga promo, dihitung otomatis

Kartu produk tetap menampilkan: nama produk, harga promo, persen diskon (`35%`), harga coret (strikethrough), tag `Produk Online`, `Instant Delivery`, tombol `+ Basket`.

**Acceptance Criteria:**
- [ ] Nilai `Lebih Hemat Rp.xx` dihitung dari `hargaNormal - hargaPromo`, bukan hardcode
- [ ] Badge `BEST DEAL` bisa di-set per promo (flag manual / rule)
- [ ] Persen diskon & harga coret konsisten dengan nilai hemat yang ditampilkan

**Out of Scope:**
- Tidak ada A/B testing framing di scope ini

---

### FEAT-2: Default Nudge & Gain-Loss Framing (Cart → Checkout)

> **Catatan klien:** Desain cart/checkout existing sudah cukup bagus (mengikuti pola Alfagift). **Hanya tambahkan bagian yang kurang.** Gain framing di checkout & after-pay sudah ada — tinggal **ganti konteksnya ke food loss & pembelian berkelanjutan.**

#### 2a. Default Promo di Keranjang

**Description:**
Di halaman keranjang (`/cart`), ada **satu promo default yang sudah ter-apply/tercentang otomatis** — misal `Gratis Ongkir` atau `Diskon Belanja`. User bisa uncheck kalau mau (default-effect nudge).

**Acceptance Criteria:**
- [ ] Saat masuk cart, promo default sudah dalam keadaan ter-apply (checked)
- [ ] User bisa melepas promo default secara manual
- [ ] Total harga ter-update mengikuti status promo
- [ ] Layout cart existing (Select All, Instant Delivery, item list, View Promo, footer total + Next) tidak dirombak

**Out of Scope:**
- Logika eligibility promo kompleks (min. belanja berjenjang) — cukup satu default sederhana yang valid

#### 2b. Savings Badge di Order Summary (Checkout)

**Description:**
Di `/checkout` / order summary, tambahkan elemen gain framing: badge/baris yang menyatakan **"Kamu telah menghemat Rp.xxx"** dari produk yang dibeli. `xxx` = total selisih harga normal vs harga akhir.

**Acceptance Criteria:**
- [ ] Total hemat dihitung dari akumulasi (hargaNormal − hargaBayar) seluruh item + promo
- [ ] Ditampilkan jelas di order summary (badge atau baris ringkasan)
- [ ] Struktur order summary existing (Rewards, Subtotal, Discount, Voucher, Delivery Fee, Total Shopping) tetap

**Out of Scope:**
- Tidak mengubah perhitungan pajak/ongkir existing

#### 2c. Food-Loss Pop-up After Payment

**Description:**
Setelah checkout & bayar sukses, muncul pop-up notifikasi dengan **konteks food loss / pembelian berkelanjutan**, kira-kira:

> *"Anda telah berkontribusi pada pengurangan food loss dengan produk segar yang Anda beli."*

**Acceptance Criteria:**
- [ ] Pop-up muncul **hanya** setelah pembayaran berhasil
- [ ] Copy bertema food loss & sustainable purchasing (ganti konteks dari gain framing generik yang lama)
- [ ] Pop-up bisa di-dismiss dan tidak nge-block flow setelahnya

**Out of Scope:**
- Tidak ada perhitungan impact metric riil (kg CO2, dll) — copy bersifat afirmatif/framing

---

### FEAT-3: Bundle / Package Card Layout (Alfagift-style)

**Konteks:** Klien ingin tampilan bundling/promosi mirip Alfagift. Ini komponen kartu **reusable** yang menampilkan satu paket berisi >1 produk. Dipakai di **dua tempat**: section "Promo Pilihan" di Home (FEAT-1b) **dan** halaman `/promo` tab `Package`/`Tebus Murah` (BUG-5). Satu komponen, satu sumber kebenaran.

**Description:**
Kartu paket menampilkan beberapa produk dalam satu penawaran, dengan harga paket yang lebih murah dari total harga satuan.

Elemen kartu:
- **Multi-product visual** — stack/grid gambar produk yang ada di dalam paket (≥2 produk)
- **Nama paket** — mis. *"Paket Tresemme Keratin Smooth – Sampo & Serum"*
- **Breakdown isi** (opsional, ringkas) — daftar produk di dalam paket
- **Harga paket** (bold) + **harga normal coret** (jumlah harga satuan)
- **Badge framing** (reuse dari FEAT-1c): `% diskon`, `Lebih Hemat Rp.xx` (auto = `normalTotal − bundlePrice`), `BEST DEAL` (opsional)
- **Badge tipe**: `Package` / `Tebus Murah` / `Free Product`
- **Badge kuantitas** `xN` kalau paket mensyaratkan beli kelipatan (mis. `x2`)
- **Tag** `Produk Online`, `Instant Delivery` (ikut pola kartu produk biasa)
- **Tombol `+ Basket`** → menambahkan **seluruh isi paket** ke keranjang sebagai satu unit promo

**Acceptance Criteria:**
- [ ] Komponen kartu bundle dipakai sama persis di Home (Promo Pilihan) & `/promo` (tab Package/Tebus Murah) — tidak ada duplikasi komponen
- [ ] Kartu menampilkan ≥2 produk dalam satu paket (multi-image)
- [ ] `Lebih Hemat Rp.xx` dihitung otomatis dari `normalTotal − bundlePrice`, bukan hardcode
- [ ] `+ Basket` menambahkan semua item paket ke cart sebagai satu entri bundle (bukan item terpisah satu-satu)
- [ ] Badge `xN` muncul hanya jika paket punya `requiredQty > 1`
- [ ] Responsif: layout konsisten di mobile & desktop

**Out of Scope:**
- Custom bundle (user bebas pilih isi paket sendiri) — paket bersifat fixed/predefined
- Stok per-item dalam paket tidak divalidasi terpisah di scope ini (asumsi paket = unit tunggal)

---

## 2. BUG FIXES

### BUG-1 — Hapus halaman Brand
**Masalah:** Item nav `Brand` membuka halaman yang 404 (`This page could not be found.`).
**Fix:** Hapus route `/brand` **dan** item `Brand` dari semua navigasi (desktop & mobile).
**AC:**
- [ ] Route `/brand` dihapus
- [ ] Tidak ada lagi link/menu "Brand" di header maupun nav manapun

---

### BUG-2 — Samakan nav desktop dengan mobile
**Masalah:** Top nav desktop beda isinya dengan bottom nav mobile.
**Fix:** Buat item navigasi desktop **konsisten dengan mobile**: `Home`, `Kategori`, `Promo`, ikon `Keranjang`, ikon `Akun`. (Hilangkan `Brand` sesuai BUG-1.)
**AC:**
- [ ] Nav desktop & mobile punya set item yang sama: Home, Kategori, Promo, Keranjang, Akun
- [ ] Tidak ada item nav yang nge-link ke route 404

---

### BUG-3 — "Lihat Semua" & banner promo nge-blank
**Masalah:** Tombol `Lihat Semua` dan banner promo, saat diklik, mengarah ke item kosong/blank.
**Fix:** Arahkan klik `Lihat Semua` dan banner promo ke halaman `/promo`.
**AC:**
- [ ] Klik `Lihat Semua` → navigate ke `/promo`
- [ ] Klik banner promo di Home → navigate ke `/promo`
- [ ] Tidak ada state blank item setelah klik

> Bergantung pada BUG-5 (halaman `/promo` harus sudah ada).

---

### BUG-4 — Halaman Akun kurang konten
**Masalah:** Halaman akun blank / minim konten.
**Fix:** Build halaman `/account` mengikuti pola Alfagift. Konten minimal:
- Header ringkas user: nama, nomor HP, status member (mis. `NEWBIE`, "Member since …")
- **Kolom progres belanja** — highlight *total hemat* user (mis. "Kamu sudah hemat Rp.xxx") → konsisten dengan savings dari FEAT-2
- Menu detail: `Account Settings`, `Ratings & Reviews`, `Application Permissions`, dll.

**AC:**
- [ ] Info ringkas user tampil (nama, no HP, status member)
- [ ] Ada section progres belanja yang menampilkan total hemat user
- [ ] Ada menu settings standar (account settings, dst.)

**Out of Scope:**
- Gamifikasi penuh (Shopping Mission, Alfa Star/Stamp) di referensi Alfagift — **opsional**, bukan wajib di scope ini

---

### BUG-5 — Halaman Promo masih blank (404)
**Masalah:** `/promo` menampilkan 404 / kosong.
**Fix:** Build halaman `/promo` penuh. Referensi struktur (Alfagift-style):
- Tab kategori promo: `Package`, `Tebus Murah`, (opsional `Free Product`, `Catalogue`)
- Filter: `Promo`, `Product Online`, `Delivery`, `Product Category`
- List promo bertingkat berdasarkan min. belanja (mis. "Shopping Min. Rp 25.000", "Rp 35.000", "Rp 50.000") dengan thumbnail produk
- Grid produk promo dengan kartu (nama, harga promo, % diskon, harga coret, `+ Basket`, badge framing dari FEAT-1c)

**AC:**
- [ ] `/promo` render tanpa 404
- [ ] Minimal ada tab Package & Tebus Murah dengan daftar promo
- [ ] Kartu produk promo punya tombol `+ Basket` yang fungsional
- [ ] Klik dari BUG-3 (Lihat Semua / banner) mendarat di sini dengan benar

**Out of Scope:**
- Semua tipe promo Alfagift tidak wajib direplikasi; cukup Package + Tebus Murah sebagai baseline

---

## 3. Data Model (tambahan / sentuhan)

```typescript
// Tambahan field/entity untuk personalisasi & savings.
// Sesuaikan dengan schema existing (Supabase/Postgres).

type ProductCategory = "sayuran_telur" | "buah" | "rumah_tangga" | "lainnya";

type UserPreferences = {
  userId: string;              // FK → User
  categories: ProductCategory[]; // hasil onboarding (bisa kosong jika skip)
  onboardingCompleted: boolean;
  onboardingSkipped: boolean;
  updatedAt: Date;
};

// Dipakai untuk savings badge (FEAT-2b) & progres akun (BUG-4).
// Bisa dihitung on-the-fly atau di-cache per order.
type OrderSavings = {
  orderId: string;             // FK → Order
  userId: string;              // FK → User
  normalTotal: number;         // total harga normal
  paidTotal: number;           // total dibayar
  savedAmount: number;         // normalTotal - paidTotal
  createdAt: Date;
};

// Akumulasi hemat user (untuk "Kamu sudah hemat Rp.xxx" di /account)
type UserSavingsSummary = {
  userId: string;
  totalSaved: number;          // SUM(OrderSavings.savedAmount)
};

type Promo = {
  id: string;
  type: "package" | "tebus_murah" | "free_product";
  minSpend: number | null;     // untuk promo berjenjang
  isBestDeal: boolean;         // badge BEST DEAL (FEAT-1c)
  isDefault: boolean;          // default-applied di cart (FEAT-2a)
  // ... field promo existing
};

// Bundle/Package fixed (FEAT-3). Dipakai di Home Promo Pilihan & /promo.
type Bundle = {
  id: string;
  name: string;                // "Paket Tresemme Keratin Smooth – Sampo & Serum"
  type: "package" | "tebus_murah" | "free_product";
  items: BundleItem[];         // >= 2 produk
  bundlePrice: number;         // harga paket
  normalTotal: number;         // SUM(item.normalPrice * item.qty) — untuk harga coret
  savedAmount: number;         // normalTotal - bundlePrice (auto, FEAT-1c)
  discountPercent: number;     // turunan dari savedAmount/normalTotal
  requiredQty: number;         // 1 default; >1 → tampilkan badge `xN`
  isBestDeal: boolean;         // badge BEST DEAL
  categories: ProductCategory[]; // untuk match preferensi di Home (FEAT-1b)
  createdAt: Date;
  updatedAt: Date;
};

type BundleItem = {
  bundleId: string;            // FK → Bundle
  productId: string;           // FK → Product
  qty: number;                 // jumlah produk ini dalam paket
  normalPrice: number;         // harga satuan normal (snapshot)
};
```

---

## 4. Implementation Order (saran)

1. **BUG-5** (build `/promo`) — prasyarat BUG-3
2. **BUG-1 + BUG-2** (cleanup nav) — cepat, low-risk
3. **BUG-3** (routing Lihat Semua/banner → `/promo`)
4. **FEAT-3** (bundle/package card component) — prasyarat FEAT-1b & dipakai di `/promo`
5. **FEAT-1** (onboarding + personalisasi Home + framing kartu)
6. **FEAT-2** (default promo cart → savings badge → food-loss popup)
7. **BUG-4** (halaman akun, pakai savings dari FEAT-2)

---

## 5. Open Questions (konfirmasi ke klien sebelum eksekusi)

- [ ] Onboarding: **wajib** atau bisa skip terus tiap login sampai dijawab? (asumsi sekarang: skip = simpan kosong, tidak ditanya lagi)
- [ ] Promo default di cart (FEAT-2a): yang mana — **Gratis Ongkir** atau **Diskon Belanja**? Ada syarat min. belanja?
- [ ] Kategori onboarding: 4 opsi ini final, atau perlu dipetakan ke kategori produk yang lebih banyak di DB?
- [ ] "Total hemat" di akun: akumulasi **seumur hidup** akun atau per periode (bulanan)?
- [ ] Halaman akun: gamifikasi (Shopping Mission, dll.) di referensi Alfagift — **masuk scope atau dilewati**?
- [ ] Tab `/promo` mana yang wajib v1? (asumsi: Package + Tebus Murah)
- [ ] Bundle (FEAT-3): isi paket **fixed** semua, atau ada paket yang user bisa pilih isinya? (asumsi: fixed)
- [ ] Bundle: ada paket yang wajib beli kelipatan (`x2`, `x3`)? Kalau ada, contoh case-nya seperti apa?
- [ ] `+ Basket` bundle: masuk cart sebagai **1 entri paket** atau ter-expand jadi item satuan? (asumsi: 1 entri paket)

---

*Scope doc — siap dipakai sebagai context untuk Claude Code / Cursor. Update kalau klien revisi jawaban open questions.*