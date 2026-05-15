import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { merchants, orders } from "@/drizzle/schema";
import { Store, Clock, ShoppingBag } from "lucide-react";

export default async function AdminDashboardPage() {
  const [totalMerchant] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(merchants);

  const [pendingMerchant] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(merchants)
    .where(eq(merchants.status, "PENDING"));

  const [totalPesanan] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders);

  const stats = [
    {
      label: "Total Merchant",
      value: totalMerchant?.count ?? 0,
      icon: Store,
    },
    {
      label: "Merchant Pending",
      value: pendingMerchant?.count ?? 0,
      icon: Clock,
    },
    {
      label: "Total Pesanan",
      value: totalPesanan?.count ?? 0,
      icon: ShoppingBag,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Ringkasan data platform NudgeCart
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-xl border bg-card p-6"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <stat.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
