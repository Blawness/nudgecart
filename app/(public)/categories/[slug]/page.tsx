import { eq, and, isNotNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  categories,
  products,
  productImages,
  merchants,
} from "@/drizzle/schema";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SearchBar } from "@/components/product/SearchBar";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  if (!category) {
    notFound();
  }

  const categoryProducts = await db
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
      and(
        eq(products.id, productImages.productId),
        eq(productImages.order, 0)
      )
    )
    .where(
      and(eq(products.categoryId, category.id), eq(products.isActive, true))
    );

  const productList = categoryProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    stock: p.stock,
    imageUrl: p.imageUrl ?? "/placeholder.svg",
    storeName: p.storeName,
    merchantId: p.merchantId,
  }));

  return (
    <div className="flex flex-col gap-6 py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold">{category.name}</h1>
      <ProductGrid products={productList} />
    </div>
  );
}
