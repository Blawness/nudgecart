import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { db } from "@/lib/db";
import {
  merchants,
  products,
  productImages,
  categories,
} from "@/drizzle/schema";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SearchBar } from "@/components/product/SearchBar";

interface MerchantPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: MerchantPageProps): Promise<Metadata> {
  const { id } = await params;
  const [merchant] = await db
    .select({ storeName: merchants.storeName })
    .from(merchants)
    .where(eq(merchants.id, id))
    .limit(1);

  if (!merchant) {
    return { title: "Toko Tidak Ditemukan" };
  }

  return {
    title: `${merchant.storeName} - NudgeCart`,
  };
}

export default async function MerchantPage({ params }: MerchantPageProps) {
  const { id } = await params;

  const [merchant] = await db
    .select()
    .from(merchants)
    .where(eq(merchants.id, id))
    .limit(1);

  if (!merchant) {
    notFound();
  }

  const merchantProducts = await db
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
      and(eq(products.merchantId, merchant.id), eq(products.isActive, true))
    );

  const productList = merchantProducts.map((p) => ({
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
      <div className="flex items-center gap-4">
        {merchant.logoUrl && (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-muted">
            <Image
              src={merchant.logoUrl}
              alt={merchant.storeName}
              fill
              unoptimized
              className="object-cover"
              sizes="64px"
            />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold">{merchant.storeName}</h1>
          {merchant.description && (
            <p className="text-sm text-muted-foreground">
              {merchant.description}
            </p>
          )}
        </div>
      </div>

      <ProductGrid products={productList} />
    </div>
  );
}
