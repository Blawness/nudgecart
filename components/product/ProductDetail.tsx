"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Store } from "lucide-react";
import { formatRupiah, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAddToCart } from "@/stores/cartStore";
import { EcoLabel } from "@/components/nudge/EcoLabel";
import { SocialNormBadge } from "@/components/nudge/SocialNormBadge";
import type { EcoLabel as EcoLabelType, SocialNormType } from "@/types";

interface ProductImage {
  id: string;
  url: string;
  order: number;
}

interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    description: string;
    images: ProductImage[];
    category: {
      id: string;
      name: string;
      slug: string;
    };
    merchant: {
      id: string;
      storeName: string;
      logoUrl?: string | null;
    };
    isEcoFriendly?: boolean;
    ecoLabel?: string | null;
    ecoTooltip?: string | null;
    socialNormType?: string | null;
    carbonFootprint?: number | null;
  };
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const setAdding = useAddToCart((s) => s.setAdding);

  const sortedImages = [...product.images].sort((a, b) => a.order - b.order);
  const outOfStock = product.stock === 0;

  const decreaseQty = () =>
    setQuantity((q) => Math.max(1, q - 1));
  const increaseQty = () =>
    setQuantity((q) => Math.min(product.stock, q + 1));

  const handleAddToCart = async () => {
    setAdding(product.id);
    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity }),
      });
      if (!res.ok) throw new Error("Gagal menambahkan ke keranjang");
      const { toast } = await import("sonner");
      toast.success("Berhasil ditambahkan ke keranjang");
    } catch {
      const { toast } = await import("sonner");
      toast.error("Gagal menambahkan ke keranjang");
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
            {sortedImages.length > 0 ? (
              <Image
                src={sortedImages[selectedImage].url}
                alt={product.name}
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Tidak ada gambar
              </div>
            )}
          </div>
          {sortedImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {sortedImages.map((img, idx) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImage(idx)}
                  className={cn(
                    "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2",
                    idx === selectedImage
                      ? "border-primary"
                      : "border-transparent"
                  )}
                >
                  <Image
                    src={img.url}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <Link
              href={`/categories/${product.category.slug}`}
              className="mb-2 inline-block"
            >
              <Badge variant="secondary">{product.category.name}</Badge>
            </Link>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            {product.isEcoFriendly && product.ecoLabel && (
              <div className="mt-1">
                <EcoLabel label={product.ecoLabel as EcoLabelType} tooltip={product.ecoTooltip} />
              </div>
            )}
            {product.isEcoFriendly && product.socialNormType && (
              <SocialNormBadge type={product.socialNormType as SocialNormType} />
            )}
            <p className="mt-2 text-xl font-semibold text-primary">
              {formatRupiah(product.price)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-muted-foreground" />
            <Link
              href={`/merchants/${product.merchant.id}`}
              className="text-sm font-medium hover:text-primary"
            >
              {product.merchant.storeName}
            </Link>
          </div>

          <div>
            <p className="text-sm">
              Stok:{" "}
              {outOfStock ? (
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                  Habis
                </Badge>
              ) : (
                <span className="font-medium">{product.stock}</span>
              )}
            </p>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          {product.carbonFootprint != null && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-3">
              <p className="text-xs text-green-700">
                🌿 Dengan membeli produk ini, kamu berkontribusi mengurangi{" "}
                <span className="font-semibold">{product.carbonFootprint} kg</span> emisi karbon.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-4">
            {!outOfStock && (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={decreaseQty}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center text-sm font-medium">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={increaseQty}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
            <Button
              size="lg"
              disabled={outOfStock}
              onClick={handleAddToCart}
              className="w-full"
            >
              {outOfStock ? "Stok Habis" : "Tambah ke Keranjang"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
