import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import {
  products,
  productImages,
  categories,
  merchants,
} from "@/drizzle/schema";
import { ProductDetail } from "@/components/product/ProductDetail";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [product] = await db
    .select({ name: products.name, description: products.description })
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);

  if (!product) {
    return { title: "Produk Tidak Ditemukan" };
  }

  return {
    title: `${product.name} - NudgeCart`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const [product] = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      stock: products.stock,
      description: products.description,
      category: {
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      },
      merchant: {
        id: merchants.id,
        storeName: merchants.storeName,
        logoUrl: merchants.logoUrl,
      },
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .innerJoin(merchants, eq(products.merchantId, merchants.id))
    .where(eq(products.slug, slug))
    .limit(1);

  if (!product) {
    notFound();
  }

  const images = await db
    .select({
      id: productImages.id,
      url: productImages.url,
      order: productImages.order,
    })
    .from(productImages)
    .where(eq(productImages.productId, product.id))
    .orderBy(productImages.order);

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <ProductDetail product={{ ...product, images }} />
    </div>
  );
}
