import { eq, isNotNull, and, or, ilike } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  products,
  productImages,
  categories,
  merchants,
  banners,
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

const categoryKeywordMap: Record<string, string[]> = {
  sayur: ["sayur", "buah"],
  protein: ["daging", "ikan", "telur"],
  sembako: ["beras", "minyak", "gula", "tepung"],
  snack: ["snack", "minuman", "kopi"],
  bumbu: ["bumbu", "rempah"],
  susu: ["susu", "yogurt"],
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
  let favoriteKeywords: string[] = [];
  if (session?.user?.id) {
    const prefs = await db
      .select({ favoriteCategories: userPreferences.favoriteCategories })
      .from(userPreferences)
      .where(eq(userPreferences.userId, session.user.id))
      .limit(1);
    if (prefs[0]?.favoriteCategories?.length) {
      favoriteKeywords = prefs[0].favoriteCategories.flatMap(
        (cat) => categoryKeywordMap[cat] ?? []
      );
    }
  }

  // Build keyword filter conditions for personalized product query
  const keywordConditions =
    !q && favoriteKeywords.length > 0
      ? favoriteKeywords.map((kw) => ilike(categories.name, `%${kw}%`))
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

  // Fetch active banners for Promo Pilihan section
  const activePromos = !q
    ? await db
        .select()
        .from(banners)
        .where(eq(banners.isActive, true))
        .orderBy(banners.order)
        .limit(4)
    : [];

  const promoHeading =
    session ? "Promo Pilihan untuk Kamu" : "Promo Terkini";

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
      {activePromos.length > 0 && (
        <section className="bg-white px-4 pt-3 pb-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-3 text-sm font-bold text-gray-800">
              {promoHeading}
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:pb-0">
              {activePromos.map((promo, index) => {
                const isGain = index % 2 === 0;
                return (
                  <Link
                    key={promo.id}
                    href={promo.link ?? "/promo"}
                    className="flex-shrink-0 w-64 sm:w-auto rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative">
                      <img
                        src={promo.imageUrl}
                        alt={promo.title}
                        className="w-full h-36 object-cover"
                      />
                      <span
                        className={`absolute top-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          isGain
                            ? "bg-red-500 text-white"
                            : "bg-yellow-400 text-gray-900"
                        }`}
                      >
                        {isGain ? "Best Deal 🎯" : "Lebih Hemat 🏷️"}
                      </span>
                    </div>
                    <div
                      className="px-3 py-2"
                      style={{
                        backgroundColor: promo.bgColor ?? "#dc2626",
                        color: promo.textColor ?? "#ffffff",
                      }}
                    >
                      <p className="text-xs font-semibold line-clamp-1">
                        {promo.title}
                      </p>
                      {promo.subtitle && (
                        <p className="text-xs opacity-80 line-clamp-1">
                          {promo.subtitle}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
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
