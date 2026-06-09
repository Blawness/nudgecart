"use client";

import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Plus, ShoppingBasket } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getBundleDiscountPercent,
  getBundleNormalTotal,
  getBundleSavings,
  type PromoBundle,
} from "@/lib/promo-bundles";
import { cn, formatRupiah } from "@/lib/utils";
import { useCartDrawer, useAddToCart } from "@/stores/cartStore";

interface BundlePackageCardProps {
  bundle: PromoBundle;
  className?: string;
}

export function BundlePackageCard({
  bundle,
  className,
}: BundlePackageCardProps) {
  const openDrawer = useCartDrawer((s) => s.open);
  const setAdding = useAddToCart((s) => s.setAdding);
  const normalTotal = getBundleNormalTotal(bundle);
  const savings = getBundleSavings(bundle);
  const discountPercent = getBundleDiscountPercent(bundle);
  const firstSlug = bundle.items[0]?.productSlug ?? bundle.id;

  const mutation = useMutation({
    mutationFn: async () => {
      const cartRes = await fetch("/api/cart/bundles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bundleId: bundle.id, quantity: 1 }),
      });
      const cartBody = await cartRes.json().catch(() => ({}));

      if (!cartRes.ok) {
        throw new Error(
          cartBody.error ?? "Gagal menambahkan paket ke keranjang",
        );
      }

      return cartBody;
    },
    onMutate: () => setAdding(firstSlug),
    onSuccess: () => {
      toast.success("Paket promo ditambahkan ke keranjang");
      openDrawer();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menambahkan paket ke keranjang");
    },
    onSettled: () => setAdding(null),
  });

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      {bundle.bestDeal && (
        <Badge className="absolute left-3 top-3 z-10 bg-red-600 text-white hover:bg-red-600">
          BEST DEAL
        </Badge>
      )}
      <div className="absolute right-3 top-3 z-10 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
        Lebih Hemat {formatRupiah(savings)}
      </div>

      <div className="bg-gray-50 px-4 pt-12 pb-4">
        <div className="grid grid-cols-2 gap-2">
          {bundle.items.slice(0, 4).map((item) => (
            <div
              key={item.productSlug}
              className="relative aspect-square overflow-hidden rounded-md bg-white"
            >
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 180px"
              />
              {(item.quantity ?? 1) > 1 && (
                <span className="absolute bottom-1 right-1 rounded-full bg-gray-900/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  x{item.quantity}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
            {bundle.type}
          </Badge>
          {bundle.requiredQty && bundle.requiredQty > 1 && (
            <Badge variant="outline">x{bundle.requiredQty}</Badge>
          )}
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
            {discountPercent}%
          </Badge>
        </div>

        <div>
          <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-gray-900">
            {bundle.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
            {bundle.items
              .map((item) =>
                (item.quantity ?? 1) > 1
                  ? `${item.name} x${item.quantity}`
                  : item.name,
              )
              .join(" + ")}
          </p>
        </div>

        <div>
          <div className="text-base font-extrabold text-primary">
            {formatRupiah(bundle.bundlePrice)}
          </div>
          <div className="text-xs text-muted-foreground line-through">
            {formatRupiah(normalTotal)}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="bg-white text-[11px]">
            Produk Online
          </Badge>
          <Badge variant="outline" className="bg-white text-[11px]">
            Instant Delivery
          </Badge>
        </div>

        <Button
          type="button"
          size="sm"
          className="w-full"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <Plus className="size-4" />
              <ShoppingBasket className="size-4" />
            </>
          )}
          + Basket
        </Button>
      </div>
    </article>
  );
}
