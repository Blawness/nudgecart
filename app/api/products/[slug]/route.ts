import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  products,
  productImages,
  categories,
  merchants,
} from "@/drizzle/schema";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const [product] = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        stock: products.stock,
        description: products.description,
        isActive: products.isActive,
        createdAt: products.createdAt,
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
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 }
      );
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

    return NextResponse.json({
      data: { ...product, images },
    });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
