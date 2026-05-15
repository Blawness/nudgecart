import { eq, isNotNull, and } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  products,
  productImages,
  categories,
  merchants,
} from "@/drizzle/schema";
import { CategoryNav } from "@/components/product/CategoryNav";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SearchBar } from "@/components/product/SearchBar";
import { HeroBanner } from "@/components/layout/HeroBanner";
import { EmptyState } from "@/components/shared/EmptyState";
import { ValueProposition } from "@/components/shared/ValueProposition";
import { AppDownloadBanner } from "@/components/shared/AppDownloadBanner";
import { Search } from "lucide-react";

interface HomePageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { q } = await searchParams;

  const allProducts = await db
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
    .leftJoin(
      productImages,
      and(eq(products.id, productImages.productId), eq(productImages.order, 0))
    )
    .where(and(eq(products.isActive, true), isNotNull(productImages.url)))
    .limit(20);

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
        <div className="mb-3 flex items-center justify-between px-4 sm:px-6 lg:px-8">
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

      {/* Value Proposition */}
      <ValueProposition />

      {/* App Download Banner */}
      <AppDownloadBanner />
    </div>
  );
}
