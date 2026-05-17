import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders, users, merchants } from "@/drizzle/schema";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as unknown as Record<string, unknown>)?.role as string | undefined;
    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
    }

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
