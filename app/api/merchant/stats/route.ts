import { NextResponse } from "next/server";
import { eq, and, count, sum, notInArray } from "drizzle-orm";
import { requireRole } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { merchants, products, orders } from "@/drizzle/schema";

export async function GET() {
  try {
    const { user: authUser, error } = await requireRole("MERCHANT");
    if (error) return error;
    const userId = authUser.id;

    const [merchant] = await db
      .select()
      .from(merchants)
      .where(eq(merchants.userId, userId))
      .limit(1);

    if (!merchant) {
      return NextResponse.json(
        { error: "Merchant tidak ditemukan" },
        { status: 404 }
      );
    }

    const [{ totalProducts }] = await db
      .select({ totalProducts: count() })
      .from(products)
      .where(eq(products.merchantId, merchant.id));

    const [{ activeOrders }] = await db
      .select({ activeOrders: count() })
      .from(orders)
      .where(
        and(
          eq(orders.merchantId, merchant.id),
          notInArray(orders.status, ["DELIVERED", "CANCELLED"])
        )
      );

    const [revenueRow] = await db
      .select({ total: sum(orders.total) })
      .from(orders)
      .where(
        and(
          eq(orders.merchantId, merchant.id),
          eq(orders.status, "DELIVERED")
        )
      );

    const [{ outOfStock }] = await db
      .select({ outOfStock: count() })
      .from(products)
      .where(
        and(
          eq(products.merchantId, merchant.id),
          eq(products.stock, 0)
        )
      );

    return NextResponse.json({
      data: {
        totalProducts: totalProducts ?? 0,
        activeOrders: activeOrders ?? 0,
        revenue: Number(revenueRow?.total) ?? 0,
        outOfStock: outOfStock ?? 0,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
