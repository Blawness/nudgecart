"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartDrawer, useAddToCart } from "@/stores/cartStore";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  productId: string;
  stock: number;
  /** Renders as a small circle icon-only button (for product cards) */
  iconOnly?: boolean;
  className?: string;
  label?: string;
}

export function AddToCartButton({
  productId,
  stock,
  iconOnly,
  className,
  label = "Tambah",
}: AddToCartButtonProps) {
  const openDrawer = useCartDrawer((s) => s.open);
  const setAdding = useAddToCart((s) => s.setAdding);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Gagal menambahkan ke keranjang");
      }
      return res.json();
    },
    onMutate: () => setAdding(productId),
    onSuccess: () => {
      toast.success("Berhasil ditambahkan ke keranjang");
      openDrawer();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menambahkan ke keranjang");
    },
    onSettled: () => setAdding(null),
  });

  const isAdding = mutation.isPending;

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          mutation.mutate();
        }}
        disabled={isAdding}
        aria-label="Tambah ke keranjang"
        className={cn(
          "flex size-9 items-center justify-center rounded-full bg-primary text-white shadow-md transition-all active:scale-95 disabled:opacity-60",
          isAdding && "cursor-wait",
          className
        )}
      >
        {isAdding ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Plus className="size-4 stroke-[2.5px]" />
        )}
      </button>
    );
  }

  return (
    <Button
      onClick={() => mutation.mutate()}
      disabled={isAdding}
      className={cn("w-full", className)}
      size="sm"
    >
      {isAdding ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
      {label}
    </Button>
  );
}
