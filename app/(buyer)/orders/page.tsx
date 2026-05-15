"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { PackageSearch } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatRupiah } from "@/lib/utils";
import type { OrderStatus } from "@/types";
import { OrderCardSkeleton } from "@/components/shared/LoadingSkeleton";

interface OrderItem {
  id: string;
  productName: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: string;
  createdAt: string;
  merchantName: string;
  orderItems: OrderItem[];
}

export default function OrdersPage() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Gagal memuat pesanan");
      const json = await res.json();
      return json.data as Order[];
    },
  });

  const orders = data ?? [];

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-heading mb-6 text-2xl font-semibold">Pesanan Saya</h1>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="Belum ada pesanan"
          description="Anda belum memiliki pesanan. Mulai belanja untuk membuat pesanan pertama Anda."
          action={{ label: "Mulai Belanja", href: "/products" }}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => {
            const itemCount = order.orderItems.reduce(
              (sum, item) => sum + item.quantity,
              0
            );
            const date = new Date(order.createdAt).toLocaleDateString(
              "id-ID",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            );

            return (
              <Card
                key={order.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => router.push(`/orders/${order.id}`)}
              >
                <CardContent className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono text-muted-foreground">
                      #{order.id.slice(0, 8)}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {order.merchantName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {date} &middot; {itemCount} item
                      </p>
                    </div>
                    <p className="text-sm font-semibold">
                      {formatRupiah(order.total)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
