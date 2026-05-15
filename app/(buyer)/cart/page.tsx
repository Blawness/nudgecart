"use client";

import { useQuery } from "@tanstack/react-query";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CartItem, type CartItemData } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyState } from "@/components/shared/EmptyState";

interface CartResponse {
  id: string;
  items: CartItemData[];
}

export default function CartPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await fetch("/api/cart");
      if (!res.ok) throw new Error("Gagal memuat keranjang");
      const json = await res.json();
      return json.data as CartResponse;
    },
  });

  const items = data?.items ?? [];

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-heading mb-6 text-2xl font-semibold">
        Keranjang Belanja
      </h1>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <Skeleton className="size-14 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Keranjang Belanja Kosong"
          description="Anda belum menambahkan produk ke keranjang. Jelajahi produk kami dan mulai belanja."
          action={{ label: "Lihat Produk", href: "/products" }}
        />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="divide-y divide-border rounded-xl border bg-card">
            {items.map((item) => (
              <div key={item.id} className="px-4">
                <CartItem item={item} />
              </div>
            ))}
          </div>
          <CartSummary items={items} shippingFee={10000} />
        </div>
      )}
    </div>
  );
}
