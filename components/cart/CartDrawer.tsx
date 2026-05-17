"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useCartDrawer } from "@/stores/cartStore";
import { useCart } from "@/hooks/useCart";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";

export function CartDrawer() {
  const { isOpen, open, close } = useCartDrawer();

  const { items, shippingFee, isLoading } = useCart({ enabled: isOpen });

  return (
    <Sheet open={isOpen} onOpenChange={(v) => (v ? open() : close())}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Keranjang Belanja</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4">
          {isLoading ? (
            <div className="flex flex-col gap-3 py-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
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
            <div className="flex flex-col items-center justify-center gap-4 py-16">
              <ShoppingCart className="size-12 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                Keranjang kosong
              </p>
              <Button
                variant="outline"
                render={<Link href="/" />}
                onClick={() => close()}
              >
                Mulai Belanja
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
        {!isLoading && items.length > 0 && (
          <>
            <Separator />
            <SheetFooter className="p-4">
              <CartSummary items={items} shippingFee={shippingFee} />
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
