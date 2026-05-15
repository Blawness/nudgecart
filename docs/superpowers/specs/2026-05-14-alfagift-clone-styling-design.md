# Alfagift Clone Styling for Pasarku — Design Spec

**Date:** 2026-05-14  
**Approach:** A — Full Alfagift Clone (White + Red Theme)  
**Scope:** Restyle the public-facing homepage and shared layout components. Data layer, auth, and API remain unchanged.

---

## 1. Goal

Clone the visual identity of Alfagift.id (white background, red primary accent, clean e-grocery layout) while keeping the Pasarku brand name and existing functionality. The result should feel like a polished Indonesian e-grocery marketplace.

## 2. Color System

Replace the current green (Segari-inspired) palette with a red/white Alfagift-inspired palette.

| Token | Old Value | New Value |
|---|---|---|
| `--background` | white | `oklch(1 0 0)` (unchanged) |
| `--foreground` | dark green | `oklch(0.22 0.02 25)` |
| `--primary` | green | `oklch(0.55 0.20 25)` — Alfagift red |
| `--primary-foreground` | white | `oklch(0.99 0 0)` |
| `--secondary` | light green | `oklch(0.96 0.02 25)` |
| `--secondary-foreground` | dark | `oklch(0.35 0.10 25)` |
| `--muted` | light green | `oklch(0.96 0 0)` |
| `--muted-foreground` | mid green | `oklch(0.55 0.02 25)` |
| `--accent` | amber | `oklch(0.55 0.20 25)` — red |
| `--accent-foreground` | white | `oklch(0.99 0 0)` |
| `--border` | light green | `oklch(0.90 0.01 25)` |
| `--input` | light green | `oklch(0.90 0.01 25)` |
| `--ring` | mid green | `oklch(0.55 0.15 25)` |
| `--radius` | 0.625rem | keep |

All green references in Tailwind classes (hero gradients, category backgrounds, etc.) must be updated to red/white equivalents.

## 3. Components

### 3.1 Navbar (`components/layout/Navbar.tsx`)
- **Background:** white with `border-b border-gray-100`
- **Logo:** "Pasarku" in **red bold text** with a red ShoppingCart icon prefix
- **Search bar:** Rounded-full, `bg-gray-50` border, **red** search icon button on the right (kayak Alfagift)
- **Right side:**
  - "Masuk" → text link `text-gray-600 hover:text-primary`
  - "Daftar" → outlined red button `border-primary text-primary hover:bg-primary hover:text-white`
  - Cart icon with red badge counter
- **Mobile:** keep current bottom nav for mobile
- Sticky top-0

### 3.2 Hero Banner (`components/layout/HeroBanner.tsx`)
- Replace gradient + emoji banners with **image-based promo banners**
- Maintain auto-slide (4s), swipeable, dot indicators
- Add "Lihat Semua" link to `/promo` di kanan atas section
- Use aspect ratio 16:7 atau fixed height ~240px
- Images: use placeholder images for now (via `https://placehold.co/800x300/dc2626/ffffff?text=Promo+Banner` or similar)

### 3.3 Categories (`components/product/CategoryNav.tsx`)
- Change from circular emoji icons to **rectangular card pills**
- Horizontal scroll with Previous/Next arrow buttons
- Each item: rounded-lg card with subtle border, icon/image on top, text below
- Remove emoji logic; use iconUrl from API or fallback to a generic icon
- Active state: red ring/border
- Background per card: white, not colored circles

### 3.4 Product Card (`components/product/ProductCard.tsx`)
- Grid: 6 columns desktop, 3-4 mobile
- Card design:
  - Image: aspect-square, object-cover, rounded-t-xl
  - Name: `line-clamp-2 text-sm font-medium text-gray-800`
  - **Price: bold red** `text-sm font-bold text-primary`
  - Badge: small "Pengiriman Instan" badge (if applicable — can be static for now)
  - **"Beli" button: full-width red** at bottom of card
- Remove store name from card (simpel)
- Remove the small AddToCart icon button; replace with full-width "Beli" CTA

### 3.5 Value Proposition Section (New: `components/shared/ValueProposition.tsx`)
- **Background:** red `bg-primary`
- 4 columns (responsive 2x2 mobile):
  1. **Gratis Ongkir** — icon (Truck) + title + desc
  2. **Sameday Delivery** — icon (Zap) + title + desc
  3. **Poin Terintegrasi** — icon (Award) + title + desc
  4. **Produk Lebih Lengkap** — icon (Package) + title + desc
- Icons: white or gold, centered
- Title: white bold, Description: white/70 small

### 3.6 App Download Banner (New: `components/shared/AppDownloadBanner.tsx`)
- Full-width banner, background red/orange gradient
- Headline: "Download Pasarku Sekarang!"
- Sub: "Lebih banyak pilihan produk & promo"
- Buttons: Google Play & App Store badges (placeholder images OK)

### 3.7 Footer (`components/layout/Footer.tsx`)
- Rewrite dari minimal jadi comprehensive:
  - **Row 1 (4 columns desktop, 2 mobile):**
    - Layanan Pelanggan: FAQ, Cara Belanja, Gratis Ongkir, Beli Voucher
    - Jelajahi: Tentang, Syarat & Ketentuan, Kebijakan Privasi, Blog
    - Metode Pembayaran: COD, BCA, Mandiri, ATM Bersama (static icons/text)
    - Ikuti Kami: Facebook, Twitter, Instagram icons + Hubungi Kami (email, call center)
  - **Row 2:**
    - App store badges (Play Store, App Store)
  - **Row 3:**
    - Copyright: `© 2026 Pasarku. PT Sumber Pasarku.`

## 4. Page Structure (`app/(public)/page.tsx`)

```
Navbar (shared layout)
├── Hero Banner Carousel
├── Category Nav (horizontal scroll)
├── Products Section ("Produk Pilihan")
│   └── ProductGrid
├── Value Proposition (red bg)
├── App Download Banner
Footer (shared layout)
```

## 5. New Files

| File | Purpose |
|---|---|
| `components/shared/ValueProposition.tsx` | 4-column benefits section |
| `components/shared/AppDownloadBanner.tsx` | App download CTA banner |

## 6. Files to Modify

| File | Changes |
|---|---|
| `app/globals.css` | Color palette (root vars) |
| `app/(public)/page.tsx` | Insert ValueProposition + AppDownloadBanner sections |
| `components/layout/Navbar.tsx` | White bg, red logo, red search button, outlined auth buttons |
| `components/layout/HeroBanner.tsx` | Image-based banners, "Lihat Semua" link |
| `components/product/CategoryNav.tsx` | Rectangular cards, remove emoji, add arrows |
| `components/product/ProductCard.tsx` | Simpler layout, full-width "Beli" button, red price |
| `components/layout/Footer.tsx` | Comprehensive multi-column footer |

## 7. Out of Scope

- No new API endpoints
- No new database schema changes
- No auth changes
- No new data fetching patterns
- No new pages (kategori, promo detail, etc.)
- No Playwright test changes (existing tests should still pass)

## 8. Testing Criteria

- `pnpm dev` runs without error
- `pnpm lint` passes
- Homepage visually matches Alfagift style: white bg, red accents, clean product grid
- Mobile responsive (navbar, categories, product grid)
- Existing auth flow (login/register) still works
- Cart functionality preserved
