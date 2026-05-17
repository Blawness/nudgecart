import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { eq, and, count, sum, notInArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { merchants, products, orders } from "@/drizzle/schema";
import { MerchantStats } from "@/components/merchant/MerchantStats";
import type { MerchantStatsData } from "@/components/merchant/MerchantStats";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const role = (session?.user as unknown as Record<string, unknown>)?.role as
    | string
    | undefined;

  if (role !== "MERCHANT" || !userId) {
    redirect("/login");
  }

  const [merchant] = await db
    .select()
    .from(merchants)
    .where(eq(merchants.userId, userId))
    .limit(1);

  if (!merchant) {
    redirect("/login");
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
        eq(products.stock, 0),
        eq(products.isActive, true)
      )
    );

  const stats: MerchantStatsData = {
    totalProducts: totalProducts ?? 0,
    activeOrders: activeOrders ?? 0,
    revenue: Number(revenueRow?.total) ?? 0,
    outOfStock: outOfStock ?? 0,
  };

  return <MerchantStats initialData={stats} />;
}
