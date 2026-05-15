"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { formatRupiah } from "@/lib/utils";
import type { OrderStatus } from "@/types";

interface Order {
  id: string;
  user: { name: string; email: string } | null;
  merchant: { storeName: string } | null;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

async function fetchOrders(): Promise<Order[]> {
  const res = await fetch("/api/admin/orders");
  if (!res.ok) throw new Error("Gagal memuat data pesanan");
  const json = await res.json();
  return json.data ?? json;
}

export default function AdminOrdersPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: fetchOrders,
  });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div>
      <h1 className="text-2xl font-bold">Pesanan</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Lihat semua pesanan dari pembeli
      </p>

      <div className="mt-6">
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : !orders || orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Belum ada pesanan</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Data pesanan akan muncul setelah ada pembeli yang melakukan pemesanan
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Pembeli</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">
                    {order.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>{order.user?.name ?? "-"}</TableCell>
                  <TableCell>{order.merchant?.storeName ?? "-"}</TableCell>
                  <TableCell>{formatRupiah(order.total)}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
