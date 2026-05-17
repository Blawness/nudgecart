"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface CartItemData {
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
  items: CartItemData[];
}

export function useCart({ enabled = true }: { enabled?: boolean } = {}) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await fetch("/api/cart");
      if (!res.ok) throw new Error("Gagal memuat keranjang");
      const json = await res.json();
      return json.data as CartResponse;
    },
    enabled,
  });

  const addToCart = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Gagal menambahkan ke keranjang");
      }
      return res.json();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) throw new Error("Gagal mengubah jumlah");
      return res.json();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const removeItem = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(`/api/cart/items/${itemId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus item");
    },
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previous = queryClient.getQueryData(["cart"]);
      queryClient.setQueryData(["cart"], (old: unknown) => {
        if (!old || typeof old !== "object") return old;
        const o = old as { data: { items: CartItemData[] } };
        return {
          ...old,
          data: {
            ...o.data,
            items: o.data.items.filter((i) => i.id !== itemId),
          },
        };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["cart"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  return {
    items: data?.items ?? [],
    shippingFee: 10000,
    isLoading,
    addToCart,
    updateQuantity,
    removeItem,
  };
}
