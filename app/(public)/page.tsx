import { eq, isNotNull, and, or, ilike } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  products,
  productImages,
  categories,
  merchants,
  userPreferences,
} from "@/drizzle/schema";
import { CategoryNav } from "@/components/product/CategoryNav";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SearchBar } from "@/components/product/SearchBar";
import { HeroBanner } from "@/components/layout/HeroBanner";
import { EmptyState } from "@/components/shared/EmptyState";
import { ValueProposition } from "@/components/shared/ValueProposition";
import { AppDownloadBanner } from "@/components/shared/AppDownloadBanner";
import { Search } from "lucide-react";
import { RecommendationSection } from "@/components/nudge/RecommendationSection";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { BundlePackageCard } from "@/components/promo/BundlePackageCard";
import { promoBundles } from "@/lib/promo-bundles";

const categoryKeywordMap: Record<string, string[]> = {
  sayuran_telur: ["sayur", "sayuran", "telur"],
  buah: ["buah", "fruit"],
  rumah_tangga: [
    "rumah",
    "tangga",
    "household",
    "pembersih",
    "sabun",
    "deterjen",
    "sembako",
    "beras",
    "minyak",
    "bumbu",
    "dapur",
  ],
  lainnya: ["lain", "lainnya", "daging", "ikan", "minuman", "snack"],
};

interface HomePageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { q } = await searchParams;
  const session = await auth();
  const userName = session?.user?.name ?? "Kamu";

  // Onboarding redirect: new BUYER users who haven't completed or skipped
  const userRole = (session?.user as unknown as Record<string, unknown>)?.role as string | undefined;
  if (session?.user?.id && userRole === "BUYER") {
    const [prefs] = await db
      .select({ onboardingCompleted: userPreferences.onboardingCompleted, onboardingSkipped: userPreferences.onboardingSkipped })
      .from(userPreferences)
      .where(eq(userPreferences.userId, session.user.id))
      .limit(1);
    if (!prefs || (!prefs.onboardingCompleted && !prefs.onboardingSkipped)) {
      redirect("/onboarding");
    }
  }

  // Fetch user preferences for personalization (only if logged in)
  let favoriteCategories: string[] = [];
  let favoriteKeywords: string[] = [];
  if (session?.user?.id) {
    const prefs = await db
      .select({ favoriteCategories: userPreferences.favoriteCategories })
      .from(userPreferences)
      .where(eq(userPreferences.userId, session.user.id))
      .limit(1);
    if (prefs[0]?.favoriteCategories?.length) {
      favoriteCategories = prefs[0].favoriteCategories;
      favoriteKeywords = favoriteCategories.flatMap(
        (cat) => categoryKeywordMap[cat] ?? []
      );
    }
  }

  // Build keyword filter conditions for personalized product query
  const keywordConditions =
    !q && favoriteKeywords.length > 0
      ? favoriteKeywords.flatMap((kw) => [
          ilike(products.name, `%${kw}%`),
          ilike(categories.name, `%${kw}%`),
          ilike(categories.slug, `%${kw}%`),
        ])
      : [];

  const baseWhere = and(eq(products.isActive, true), isNotNull(productImages.url));

  // Try personalized query first; fall back to all products if empty
  let allProducts = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      stock: products.stock,
      imageUrl: productImages.url,
      storeName: merchants.storeName,
      merchantId: merchants.id,
    })
    .from(products)
    .innerJoin(merchants, eq(products.merchantId, merchants.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(
      productImages,
      and(eq(products.id, productImages.productId), eq(productImages.order, 0))
    )
    .where(
      keywordConditions.length > 0
        ? and(baseWhere, or(...keywordConditions))
        : baseWhere
    )
    .limit(20);

  // Fall back to all products if personalized query yielded nothing
  if (keywordConditions.length > 0 && allProducts.length === 0) {
    allProducts = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        stock: products.stock,
        imageUrl: productImages.url,
        storeName: merchants.storeName,
        merchantId: merchants.id,
      })
      .from(products)
      .innerJoin(merchants, eq(products.merchantId, merchants.id))
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(
        productImages,
        and(eq(products.id, productImages.productId), eq(productImages.order, 0))
      )
      .where(baseWhere)
      .limit(20);
  }

  const productList = allProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    stock: p.stock,
    imageUrl: p.imageUrl ?? "/placeholder.svg",
    storeName: p.storeName,
    merchantId: p.merchantId,
  }));

  const filteredProducts = q
    ? productList.filter((p) =>
        p.name.toLowerCase().includes(q.toLowerCase())
      )
    : productList;

  const personalizedPromoBundles =
    favoriteCategories.length > 0
      ? promoBundles.filter((bundle) =>
          bundle.categories.some((category) =>
            favoriteCategories.includes(category),
          ),
        )
      : promoBundles;
  const homePromoBundles = !q
    ? (personalizedPromoBundles.length > 0
        ? personalizedPromoBundles
        : promoBundles
      ).slice(0, 4)
    : [];

  return (
    <div className="flex flex-col">
      {/* Mobile search header */}
      <div className="bg-white px-4 pt-3 pb-3 sm:hidden">
        <SearchBar
          className="w-full"
          placeholder="Cari beragam kebutuhan harian"
        />
      </div>

      {/* Hero banner */}
      <HeroBanner />

      {/* Categories */}
      <section className="bg-white pt-5 pb-3">
        <div className="mx-auto mb-3 flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <h2 className="text-sm font-bold text-gray-800">Kategori</h2>
        </div>
        <CategoryNav />
      </section>

      {/* Products */}
      <section className="bg-white px-4 pt-3 pb-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-3 text-sm font-bold text-gray-800">
            {q ? `Hasil pencarian "${q}"` : "Produk Pilihan"}
          </h2>

          {q && filteredProducts.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Produk tidak ditemukan"
              description="Coba cari dengan kata kunci yang berbeda."
            />
          ) : (
            <ProductGrid products={filteredProducts} />
          )}
        </div>
      </section>

      {/* Promo Pilihan */}
      {!q && (
        <section className="bg-white px-4 pt-3 pb-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-800">Promo Pilihan</h2>
              <Link href="/promo" className="text-xs font-semibold text-primary">
                Lihat Semua
              </Link>
            </div>

            {homePromoBundles.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:pb-0">
                {homePromoBundles.map((promo) => (
                  <BundlePackageCard
                    key={promo.id}
                    bundle={promo}
                    className="w-72 flex-shrink-0 sm:w-auto"
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Search}
                title="Belum ada promo pilihan"
                description="Promo terbaru akan muncul di sini saat tersedia."
              />
            )}
          </div>
        </section>
      )}

      {/* Recommendation Sections */}
      <section className="bg-white px-4 pt-3 pb-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <RecommendationSection userName={userName} isAuthenticated={!!session} />
        </div>
      </section>

      {/* Value Proposition */}
      <ValueProposition />

      {/* App Download Banner */}
      <AppDownloadBanner />
    </div>
  );
}
