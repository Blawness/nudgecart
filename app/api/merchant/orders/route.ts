import { NextResponse } from "next/server";
import { eq, desc, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  merchants,
  orders,
  orderItems,
  users,
} from "@/drizzle/schema";

export async function GET() {
  try {
    const session = await auth();
    const role = (session?.user as unknown as Record<string, unknown>)?.role as
      | string
      | undefined;
    const userId = session?.user?.id;

    if (role !== "MERCHANT" || !userId) {
      return NextResponse.json(
        { error: "Tidak memiliki akses" },
        { status: 401 }
      );
    }

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

    const orderList = await db
      .select()
      .from(orders)
      .where(eq(orders.merchantId, merchant.id))
      .orderBy(desc(orders.createdAt));

    if (orderList.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const orderIds = orderList.map((o) => o.id);

    const items =
      orderIds.length > 0
        ? await db
            .select()
            .from(orderItems)
            .where(inArray(orderItems.orderId, orderIds))
        : [];

    const buyerIds = [...new Set(orderList.map((o) => o.userId))];

    const buyerList =
      buyerIds.length > 0
        ? await db
            .select({
              id: users.id,
              name: users.name,
              email: users.email,
            })
            .from(users)
            .where(inArray(users.id, buyerIds))
        : [];

    const result = orderList.map((order) => {
      const orderItemsList = items
        .filter((item) => item.orderId === order.id)
        .map((item) => ({
          productId: item.productId,
          productName: item.productName,
          productPrice: item.productPrice,
          quantity: item.quantity,
          subtotal: item.subtotal,
        }));
      const buyer = buyerList.find((u) => u.id === order.userId);
      return {
        ...order,
        items: orderItemsList,
        buyer: buyer ?? null,
      };
    });

    return NextResponse.json({ data: result });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
