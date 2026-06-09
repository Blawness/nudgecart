export type PromoBundleType = "Package" | "Tebus Murah" | "Free Product";

export interface PromoBundleItem {
  name: string;
  imageUrl: string;
  productSlug: string;
  normalPrice: number;
  quantity?: number;
}

export interface PromoBundle {
  id: string;
  type: PromoBundleType;
  name: string;
  items: PromoBundleItem[];
  categories: string[];
  bundlePrice: number;
  minSpend: number;
  bestDeal?: boolean;
  requiredQty?: number;
}

export function getBundleNormalTotal(bundle: PromoBundle): number {
  return bundle.items.reduce(
    (total, item) => total + item.normalPrice * (item.quantity ?? 1),
    0,
  );
}

export function getBundleSavings(bundle: PromoBundle): number {
  return Math.max(getBundleNormalTotal(bundle) - bundle.bundlePrice, 0);
}

export function getBundleDiscountPercent(bundle: PromoBundle): number {
  const normalTotal = getBundleNormalTotal(bundle);
  if (normalTotal <= 0) return 0;
  return Math.round((getBundleSavings(bundle) / normalTotal) * 100);
}

export const promoFilterChips = [
  "Promo",
  "Product Online",
  "Delivery",
  "Product Category",
] as const;

export const promoBundles: PromoBundle[] = [
  {
    id: "package-sayur-protein",
    type: "Package",
    name: "Paket Masak Sehat - Sayur & Protein",
    categories: ["sayuran_telur", "lainnya"],
    minSpend: 25000,
    bundlePrice: 42000,
    bestDeal: true,
    items: [
      {
        name: "Bayam Segar",
        productSlug: "bayam-segar-toko-segar",
        normalPrice: 5000,
        imageUrl:
          "https://o76166p4ua.ufs.sh/f/vujehKPKzjOf7zJD6rcLumptj0Wb5BGdODlSga68IRXwizy4",
      },
      {
        name: "Wortel Lokal",
        productSlug: "wortel-impor-toko-segar",
        normalPrice: 8000,
        imageUrl:
          "https://o76166p4ua.ufs.sh/f/vujehKPKzjOfUjLo8in2VSJ7MWisILoyGbt89jfeaEgvFcUk",
      },
      {
        name: "Daging Ayam Fillet",
        productSlug: "daging-ayam-fillet-toko-segar",
        normalPrice: 25000,
        quantity: 2,
        imageUrl:
          "https://o76166p4ua.ufs.sh/f/vujehKPKzjOfndwBNMrkGNYo9HVqmvtjJlRayFgbKEwMTS4i",
      },
    ],
  },
  {
    id: "package-buah-harian",
    type: "Package",
    name: "Paket Buah Harian Keluarga",
    categories: ["buah"],
    minSpend: 35000,
    bundlePrice: 39000,
    requiredQty: 2,
    items: [
      {
        name: "Apel Fuji",
        productSlug: "apel-fuji-toko-segar",
        normalPrice: 15000,
        imageUrl:
          "https://o76166p4ua.ufs.sh/f/vujehKPKzjOfM3rDA6Gcpv6WE0ZIrfC8O427qkJnbPTaYdgw",
      },
      {
        name: "Pisang Cavendish",
        productSlug: "pisang-cavendish-toko-segar",
        normalPrice: 10000,
        quantity: 2,
        imageUrl:
          "https://o76166p4ua.ufs.sh/f/vujehKPKzjOfpfbtk4ytpjiXmhz12VaJNElkuTQ7wHLgo68O",
      },
      {
        name: "Jeruk Mandarin",
        productSlug: "jeruk-mandarin-toko-segar",
        normalPrice: 18000,
        imageUrl:
          "https://o76166p4ua.ufs.sh/f/vujehKPKzjOfhoWXeDTdb2QYJvFC8Gi3wMIrtRmLWnZB56OH",
      },
    ],
  },
  {
    id: "tebus-telur-beras",
    type: "Tebus Murah",
    name: "Tebus Murah Sarapan Hemat",
    categories: ["sayuran_telur", "rumah_tangga"],
    minSpend: 50000,
    bundlePrice: 31500,
    bestDeal: true,
    items: [
      {
        name: "Telur Ayam",
        productSlug: "telur-ayam-toko-segar",
        normalPrice: 25000,
        imageUrl:
          "https://o76166p4ua.ufs.sh/f/vujehKPKzjOf00Q31ZDvDtGKchLwgfXZFroQNsda7pkRI2HU",
      },
      {
        name: "Beras Premium",
        productSlug: "beras-premium-toko-segar",
        normalPrice: 16000,
        imageUrl:
          "https://o76166p4ua.ufs.sh/f/vujehKPKzjOfCH7Q7TPFduGqKyjOz0tHfbWQxm36eh7w1S5I",
      },
    ],
  },
  {
    id: "tebus-segar-lauk",
    type: "Tebus Murah",
    name: "Tebus Murah Lauk Segar",
    categories: ["sayuran_telur", "lainnya"],
    minSpend: 50000,
    bundlePrice: 52000,
    requiredQty: 2,
    items: [
      {
        name: "Ikan Salmon Fillet",
        productSlug: "ikan-salmon-fillet-toko-segar",
        normalPrice: 55000,
        imageUrl:
          "https://o76166p4ua.ufs.sh/f/vujehKPKzjOfjODLjMIKSdT5s6E3oqtQrGA2xkFO0MIvw4NZ",
      },
      {
        name: "Udang Segar",
        productSlug: "udang-segar-toko-segar",
        normalPrice: 45000,
        imageUrl:
          "https://o76166p4ua.ufs.sh/f/vujehKPKzjOfq2WgVwz74wRPXAekBtfSFhoGZjCnEDmY93ad",
      },
    ],
  },
];

export const promoTabs = ["Package", "Tebus Murah"] as const;
