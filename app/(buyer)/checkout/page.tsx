"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShoppingBag, ChevronLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { AddressPicker } from "@/components/checkout/AddressPicker";
import { PaymentMethodPicker } from "@/components/checkout/PaymentMethodPicker";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatRupiah } from "@/lib/utils";
import type { PaymentMethod } from "@/types";

interface CheckoutCartItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  stock: number;
  imageUrl: string;
  quantity: number;
  merchantId: string;
  merchantName: string;
}

interface CartResponse {
  id: string;
  items: CheckoutCartItem[];
}

interface MerchantGroup {
  merchantId: string;
  merchantName: string;
  items: CheckoutCartItem[];
}

export default function CheckoutPage() {
  const router = useRouter();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [note, setNote] = useState("");

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

  const groups: MerchantGroup[] = (() => {
    const map = new Map<string, MerchantGroup>();
    for (const item of items) {
      const existing = map.get(item.merchantId);
      if (existing) {
        existing.items.push(item);
      } else {
        map.set(item.merchantId, {
          merchantId: item.merchantId,
          merchantName: item.merchantName,
          items: [item],
        });
      }
    }
    return Array.from(map.values());
  })();

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: selectedAddressId,
          paymentMethod,
          note: note || undefined,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Gagal membuat pesanan");
      }
      return res.json();
    },
    onSuccess: (res) => {
      const orders = res.data as Array<{ id: string }>;
      toast.success("Pesanan berhasil dibuat");
      if (orders.length > 0) {
        router.push(`/orders/${orders[0].id}`);
      } else {
        router.push("/orders");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = () => {
    if (!selectedAddressId) {
      toast.error("Pilih alamat pengiriman terlebih dahulu");
      return;
    }
    if (!paymentMethod) {
      toast.error("Pilih metode pembayaran terlebih dahulu");
      return;
    }
    checkoutMutation.mutate();
  };

  if (!isLoading && items.length === 0) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <EmptyState
          icon={ShoppingBag}
          title="Keranjang Kosong"
          description="Tambahkan produk ke keranjang sebelum checkout."
          action={{ label: "Ke Keranjang", href: "/cart" }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/cart"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Kembali ke Keranjang
      </Link>

      <h1 className="font-heading mb-6 text-2xl font-semibold">Checkout</h1>

      {isLoading ? (
        <div className="flex flex-col gap-6">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <AddressPicker
            value={selectedAddressId}
            onChange={setSelectedAddressId}
          />

          {groups.map((group) => {
            const subtotal = group.items.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            );
            const shippingFee = 10000;
            const total = subtotal + shippingFee;

            return (
              <Card key={group.merchantId}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {group.merchantName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="divide-y divide-border rounded-lg border">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between px-3 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {item.productName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} x {formatRupiah(item.price)}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-medium">
                          {formatRupiah(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatRupiah(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ongkos Kirim</span>
                      <span>{formatRupiah(shippingFee)}</span>
                    </div>
                    <Separator className="my-1" />
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>{formatRupiah(total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <PaymentMethodPicker
            value={paymentMethod}
            onChange={setPaymentMethod}
          />

          <div className="flex flex-col gap-2">
            <label
              htmlFor="note"
              className="font-heading text-base font-medium"
            >
              Catatan (Opsional)
            </label>
            <Textarea
              id="note"
              placeholder="Catatan untuk pesanan Anda..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            className="w-full"
            size="lg"
            disabled={checkoutMutation.isPending}
            onClick={handleSubmit}
          >
            {checkoutMutation.isPending ? "Membuat Pesanan..." : "Buat Pesanan"}
          </Button>
        </div>
      )}
    </div>
  );
}
