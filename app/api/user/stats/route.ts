import { NextResponse } from "next/server";
import { and, eq, ne, sum, count, sql } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import * as schema from "@/drizzle/schema";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id as string;

  // Count non-cancelled orders and sum their totals. Product normal-price
  // snapshots do not exist yet, so v1 savings only count shipping discounts.
  const ordersResult = await db
    .select({
      totalOrders: count(schema.orders.id),
      totalSpent: sum(schema.orders.total),
      totalSaved: sql<number>`sum(greatest(10000 - ${schema.orders.shippingFee}, 0))`,
    })
    .from(schema.orders)
    .where(
      and(
        eq(schema.orders.userId, userId),
        ne(schema.orders.status, "CANCELLED")
      )
    );

  // Sum all quantities from order items for non-cancelled orders
  const itemsResult = await db
    .select({
      totalItems: sum(schema.orderItems.quantity),
    })
    .from(schema.orderItems)
    .innerJoin(schema.orders, eq(schema.orderItems.orderId, schema.orders.id))
    .where(
      and(
        eq(schema.orders.userId, userId),
        ne(schema.orders.status, "CANCELLED")
      )
    );

  const [user] = await db
    .select({
      phone: schema.users.phone,
      memberSince: schema.users.createdAt,
    })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  const totalOrders = Number(ordersResult[0]?.totalOrders ?? 0);
  const totalSpent = Number(ordersResult[0]?.totalSpent ?? 0);
  const totalItems = Number(itemsResult[0]?.totalItems ?? 0);
  const totalSaved = Number(ordersResult[0]?.totalSaved ?? 0);

  return NextResponse.json({
    data: {
      totalOrders,
      totalSpent,
      totalItems,
      totalSaved,
      phone: user?.phone ?? null,
      memberSince: user?.memberSince ?? null,
    },
  });
}
