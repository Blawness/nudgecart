import { NextRequest, NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  products,
  productImages,
  categories,
  merchants,
} from "@/drizzle/schema";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || null;
    const merchantId = searchParams.get("merchant")?.trim() || null;
    const status = searchParams.get("status")?.trim() || null;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const offset = (page - 1) * limit;

    const conditions = [];

    if (q) {
      conditions.push(sql`${products.name} ILIKE ${`%${q}%`}`);
    }

    if (merchantId) {
      conditions.push(eq(products.merchantId, merchantId));
    }

    if (status === "active") {
      conditions.push(eq(products.isActive, true));
    } else if (status === "inactive") {
      conditions.push(eq(products.isActive, false));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

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
        },
        firstImage: {
          url: productImages.url,
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
