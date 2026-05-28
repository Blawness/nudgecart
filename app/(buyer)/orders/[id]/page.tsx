"use client";

import { Suspense } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, XCircle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { NudgePostPurchase } from "@/components/nudge/NudgePostPurchase";
import { formatRupiah } from "@/lib/utils";
import type { OrderStatus } from "@/types";

interface OrderItem {
  id: string;
  productName: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
}

interface Address {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
}

interface OrderDetail {
  id: string;
  merchantName: string;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  address: Address | null;
}

const bankInfo = {
  bank: "BCA",
  accountNumber: "1234567890",
  accountName: "PT NudgeCart Indonesia",
};

function OrderDetailContent() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const orderId = params.id as string;

  const { data, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("Pesanan tidak ditemukan");
        throw new Error("Gagal memuat pesanan");
      }
      const json = await res.json();
      return json.data as OrderDetail;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "PUT",
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Gagal membatalkan pesanan");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Pesanan berhasil dibatalkan");
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Skeleton className="mb-6 h-8 w-32" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <p className="text-center text-muted-foreground">
          Pesanan tidak ditemukan
        </p>
      </div>
    );
  }

  const canCancel =
    data.status === "PENDING_PAYMENT" || data.status === "CONFIRMED";
  const date = new Date(data.createdAt).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/orders"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Kembali ke Pesanan
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">
            Pesanan #{data.id.slice(0, 8)}
          </h1>
          <p className="text-sm text-muted-foreground">{date}</p>
        </div>
        <StatusBadge status={data.status} />
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {data.merchantName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border rounded-lg border">
              <div className="grid grid-cols-5 gap-2 px-3 py-2 text-xs font-medium text-muted-foreground">
                <span className="col-span-2">Produk</span>
                <span className="text-center">Harga</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Subtotal</span>
              </div>
              {data.items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-5 gap-2 px-3 py-2 text-sm"
                >
                  <span className="col-span-2">{item.productName}</span>
                  <span className="text-center">
                    {formatRupiah(item.productPrice)}
                  </span>
                  <span className="text-center">{item.quantity}</span>
                  <span className="text-right font-medium">
                    {formatRupiah(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {data.address && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Alamat Pengiriman</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">
                {data.address.label} &mdash; {data.address.recipientName}
              </p>
              <p className="text-sm text-muted-foreground">
                {data.address.phone}
              </p>
              <p className="text-sm text-muted-foreground">
                {data.address.street}, {data.address.city},{" "}
                {data.address.province}, {data.address.postalCode}
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rincian Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Metode Pembayaran</span>
              <span>
                {data.paymentMethod === "BANK_TRANSFER"
                  ? "Transfer Bank"
                  : "COD"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatRupiah(data.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ongkos Kirim</span>
              <span>{formatRupiah(data.shippingFee)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatRupiah(data.total)}</span>
            </div>
          </CardContent>
        </Card>

        {data.paymentMethod === "BANK_TRANSFER" &&
          data.status === "PENDING_PAYMENT" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Informasi Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bank</span>
                  <span className="font-medium">{bankInfo.bank}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nomor Rekening</span>
                  <span className="font-mono font-medium">
                    {bankInfo.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Atas Nama</span>
                  <span>{bankInfo.accountName}</span>
                </div>
              </CardContent>
            </Card>
          )}

        {data.note && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Catatan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{data.note}</p>
            </CardContent>
          </Card>
        )}

        {canCancel && (
          <Button
            variant="destructive"
            size="lg"
            className="w-full"
            disabled={cancelMutation.isPending}
            onClick={() => cancelMutation.mutate()}
          >
            <XCircle className="size-4" />
            {cancelMutation.isPending
              ? "Membatalkan..."
              : "Batalkan Pesanan"}
          </Button>
        )}

        {data && data.status !== "CANCELLED" && (
          <NudgePostPurchase
            headline="Terima kasih telah berkontribusi! 🌿"
            body="Dengan membeli produk segar, kamu telah berkontribusi pada pengurangan food loss. Produk segar yang kamu beli membantu petani lokal dan mengurangi pemborosan pangan."
            ctaText="Belanja Produk Segar Lagi"
            ecoCount={0}
            recommendations={[]}
            showConfetti={data.status === "PENDING_PAYMENT" || data.status === "CONFIRMED"}
          />
        )}
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-2xl px-4 py-8">
          <Skeleton className="mb-6 h-8 w-32" />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </div>
      }
    >
      <OrderDetailContent />
    </Suspense>
  );
}
