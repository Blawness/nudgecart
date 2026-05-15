import { NextRequest, NextResponse } from "next/server";
import { eq, and, sql, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  products,
  productImages,
  categories,
  merchants,
} from "@/drizzle/schema";

export async function GET(request: NextRequest) {
  try {
    const { searchParams: params } = request.nextUrl;
    const q = params.get("q")?.trim() || null;
    const categorySlug = params.get("category")?.trim() || null;
    const page = Math.max(1, parseInt(params.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(params.get("limit") ?? "20", 10)));
    const offset = (page - 1) * limit;

    let categoryId: string | null = null;
    if (categorySlug) {
      const [found] = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, categorySlug))
        .limit(1);
      if (found) {
        categoryId = found.id;
      }
    }

    const conditions: ReturnType<typeof eq>[] = [
      eq(products.isActive, true),
    ];

    if (q) {
      conditions.push(
        sql`${products.name} ILIKE ${`%${q}%`}`
      );
    }

    if (categoryId) {
      conditions.push(eq(products.categoryId, categoryId));
    }

    const whereClause = and(...conditions);

    const [countResult] = await db
      .select({ total: sql<number>`count(*)` })
      .from(products)
      .where(whereClause);

    const total = Number(countResult?.total ?? 0);

    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        stock: products.stock,
        description: products.description,
        isActive: products.isActive,
        isEcoFriendly: products.isEcoFriendly,
        ecoLabel: products.ecoLabel,
        carbonFootprint: products.carbonFootprint,
        socialNormType: products.socialNormType,
        createdAt: products.createdAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        },
        merchant: {
          id: merchants.id,
          storeName: merchants.storeName,
        },
        firstImage: {
          id: productImages.id,
          url: productImages.url,
          order: productImages.order,
        },
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .innerJoin(merchants, eq(products.merchantId, merchants.id))
      .leftJoin(
        productImages,
        and(
          eq(products.id, productImages.productId),
          eq(productImages.order, 0)
        )
      )
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(products.createdAt);

    const data = rows.map((row) => ({
      ...row,
      imageUrl: row.firstImage?.url ?? null,
    }));

    return NextResponse.json({
      data,
      total,
      page,
      limit,
    });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
