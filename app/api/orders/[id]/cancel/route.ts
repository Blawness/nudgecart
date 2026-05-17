import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders, orderItems, products, merchants } from "@/drizzle/schema";

export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const { id } = await params;

    const [order] = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        status: orders.status,
      })
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
    }

    if (order.status !== "PENDING_PAYMENT" && order.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "Pesanan tidak dapat dibatalkan" },
        { status: 400 }
      );
    }

    const [updated] = await db.transaction(async (tx) => {
      const [cancelled] = await tx
        .update(orders)
        .set({ status: "CANCELLED", updatedAt: new Date() })
        .where(eq(orders.id, id))
        .returning();

      const items = await tx
        .select({
          productId: orderItems.productId,
          quantity: orderItems.quantity,
        })
        .from(orderItems)
        .where(eq(orderItems.orderId, id));

      for (const item of items) {
        await tx
          .update(products)
          .set({ stock: sql`${products.stock} + ${item.quantity}` })
          .where(eq(products.id, item.productId));
      }

      return [cancelled];
    });

    const items = await db
      .select({
        id: orderItems.id,
        productId: orderItems.productId,
        productName: orderItems.productName,
        productPrice: orderItems.productPrice,
        quantity: orderItems.quantity,
        subtotal: orderItems.subtotal,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));

    const [merchant] = await db
      .select({ storeName: merchants.storeName })
      .from(merchants)
      .where(eq(merchants.id, updated.merchantId))
      .limit(1);

    return NextResponse.json({
      data: {
        ...updated,
        items,
        merchantName: merchant?.storeName ?? "",
      },
    });
  } catch {
    return NextResponse.json({ error: "Gagal membatalkan pesanan" }, { status: 500 });
  }
}
