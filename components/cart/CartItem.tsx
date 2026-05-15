"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils";

export interface CartItemData {
  id: string;
  productId: string;
  productName: string;
  price: number;
  stock: number;
  imageUrl: string;
  quantity: number;
}

interface CartItemProps {
  item: CartItemData;
}

export function CartItem({ item }: CartItemProps) {
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const updateMutation = useMutation({
    mutationFn: async (quantity: number) => {
      const res = await fetch(`/api/cart/items/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) throw new Error("Gagal mengubah jumlah");
      return res.json();
    },
    onMutate: async (newQuantity) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData(["cart"]);
      queryClient.setQueryData(["cart"], (old: unknown) => {
        if (
          !old ||
          typeof old !== "object" ||
          !("data" in old) ||
          !old.data ||
          typeof old.data !== "object" ||
          !("items" in old.data)
        )
          return old;
        const data = old.data as { items: CartItemData[] };
        return {
          ...old,
          data: {
            ...data,
            items: data.items.map((ci) =>
              ci.id === item.id ? { ...ci, quantity: newQuantity } : ci
            ),
          },
        };
      });
      return { previousCart };
    },
    onError: (_err, _newQuantity, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/cart/items/${item.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus item");
      return res.json();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData(["cart"]);
      queryClient.setQueryData(["cart"], (old: unknown) => {
        if (
          !old ||
          typeof old !== "object" ||
          !("data" in old) ||
          !old.data ||
          typeof old.data !== "object" ||
          !("items" in old.data)
        )
          return old;
        const data = old.data as { items: CartItemData[] };
        return {
          ...old,
          data: {
            ...data,
            items: data.items.filter((ci) => ci.id !== item.id),
          },
        };
      });
      return { previousCart };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const subtotal = item.price * item.quantity;

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
        <Image
          src={item.imageUrl}
          alt={item.productName}
          fill
          className="object-cover"
          sizes="56px"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.productName}</p>
        <p className="text-sm text-muted-foreground">
          {formatRupiah(item.price)}
        </p>
        <div className="mt-1 flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-xs"
            disabled={item.quantity <= 1 || updateMutation.isPending}
            onClick={() => updateMutation.mutate(item.quantity - 1)}
          >
            <Minus className="size-3" />
          </Button>
          <span className="w-8 text-center text-sm tabular-nums">
            {item.quantity}
          </span>
          <Button
            variant="outline"
            size="icon-xs"
            disabled={item.quantity >= item.stock || updateMutation.isPending}
            onClick={() => updateMutation.mutate(item.quantity + 1)}
          >
            <Plus className="size-3" />
          </Button>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">{formatRupiah(subtotal)}</p>
        {!showDeleteConfirm ? (
          <Button
            variant="ghost"
            size="icon-xs"
            className="mt-1 text-muted-foreground hover:text-destructive"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        ) : (
          <div className="mt-1 flex items-center gap-1">
            <Button
              variant="destructive"
              size="xs"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              Hapus
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Batal
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
