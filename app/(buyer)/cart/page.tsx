"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Tag, CheckCircle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyState } from "@/components/shared/EmptyState";
import { NudgeInlineBanner } from "@/components/nudge/NudgeInlineBanner";
import { formatRupiah } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import { useNudge } from "@/hooks/useNudge";

export default function CartPage() {
  const { items, isLoading } = useCart();

  const { evaluateNudge, logEvent, userId, incrementInteraction } = useNudge();
  const [nudgeContent, setNudgeContent] = useState<{
    headline: string;
    body: string;
    ctaText: string;
    nudgeType: string;
    framingType: string | null;
  } | null>(null);

  useEffect(() => {
    if (userId && items.length > 0 && !nudgeContent) {
      evaluateNudge.mutate(
        { context: "CART" },
        {
          onSuccess: (decision) => {
            if (decision.shouldShow && decision.content && decision.nudgeType) {
              setNudgeContent({
                headline: decision.content.headline,
                body: decision.content.body,
                ctaText: decision.content.ctaText,
                nudgeType: decision.nudgeType,
                framingType: decision.framingType,
              });
              incrementInteraction();
            }
          },
        }
      );
    }
  }, [userId, items.length]);

  const handleNudgeAccept = () => {
    if (nudgeContent) {
      logEvent.mutate({
        nudgeType: nudgeContent.nudgeType,
        framingType: nudgeContent.framingType,
        nudgeContext: "CART",
        event: "NUDGE_ACCEPTED",
      });
    }
    setNudgeContent(null);
  };

  const handleNudgeDismiss = () => {
    if (nudgeContent) {
      logEvent.mutate({
        nudgeType: nudgeContent.nudgeType,
        framingType: nudgeContent.framingType,
        nudgeContext: "CART",
        event: "NUDGE_DISMISSED",
      });
    }
    setNudgeContent(null);
  };

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
          {(() => {
            const subtotal = items.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            );
            return (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  <Tag className="size-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-amber-900">
                      Promo Default Aktif 🎉
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      <CheckCircle className="size-3" />
                      Diterapkan
                    </span>
                  </div>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Gratis ongkir untuk pembelian min. Rp 50.000
                  </p>
                  <p
                    className={`text-xs font-medium mt-1 ${
                      subtotal >= 50000
                        ? "text-green-700"
                        : "text-amber-800"
                    }`}
                  >
                    {subtotal >= 50000
                      ? "✓ Gratis ongkir diterapkan!"
                      : `Tambah ${formatRupiah(50000 - subtotal)} lagi untuk gratis ongkir`}
                  </p>
                </div>
              </div>
            );
          })()}

          <div className="divide-y divide-border rounded-xl border bg-card">
            {items.map((item) => (
              <div key={item.id} className="px-4">
                <CartItem item={item} />
              </div>
            ))}
          </div>

          {nudgeContent && (
            <NudgeInlineBanner
              headline={nudgeContent.headline}
              body={nudgeContent.body}
              ctaText={nudgeContent.ctaText}
              onAccept={handleNudgeAccept}
              onDismiss={handleNudgeDismiss}
            />
          )}

          <CartSummary items={items} shippingFee={10000} />
        </div>
      )}
    </div>
  );
}
