import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, users, merchants } from "@/drizzle/schema";
import { requireRole } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireRole("ADMIN");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");

    const result = await db
      .select({
        id: orders.id,
        total: orders.total,
        subtotal: orders.subtotal,
        shippingFee: orders.shippingFee,
        status: orders.status,
        paymentMethod: orders.paymentMethod,
        note: orders.note,
        createdAt: orders.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        merchant: {
          id: merchants.id,
          storeName: merchants.storeName,
        },
      })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .innerJoin(merchants, eq(orders.merchantId, merchants.id))
      .where(
        statusFilter
          ? eq(
              orders.status,
              statusFilter as
                | "PENDING_PAYMENT"
                | "CONFIRMED"
                | "PROCESSING"
                | "SHIPPED"
                | "DELIVERED"
                | "CANCELLED"
            )
          : undefined
      )
      .orderBy(orders.createdAt);

    return NextResponse.json({ data: result });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
