"use client";

import { OrderTable } from "@/components/merchant/OrderTable";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Pesanan</h2>
      <OrderTable />
    </div>
  );
}
