import { NextResponse } from "next/server";
import { eq, ne, sum, count } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import * as schema from "@/drizzle/schema";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id as string;

  // Count non-cancelled orders and sum their totals
  const ordersResult = await db
    .select({
      totalOrders: count(schema.orders.id),
      totalSpent: sum(schema.orders.total),
    })
    .from(schema.orders)
    .where(
      eq(schema.orders.userId, userId) &&
        ne(schema.orders.status, "CANCELLED")
    );

  // Sum all quantities from order items for non-cancelled orders
  const itemsResult = await db
    .select({
      totalItems: sum(schema.orderItems.quantity),
    })
    .from(schema.orderItems)
    .innerJoin(schema.orders, eq(schema.orderItems.orderId, schema.orders.id))
    .where(
      eq(schema.orders.userId, userId) &&
        ne(schema.orders.status, "CANCELLED")
    );

  const totalOrders = Number(ordersResult[0]?.totalOrders ?? 0);
  const totalSpent = Number(ordersResult[0]?.totalSpent ?? 0);
  const totalItems = Number(itemsResult[0]?.totalItems ?? 0);

  return NextResponse.json({
    data: { totalOrders, totalSpent, totalItems },
  });
}
