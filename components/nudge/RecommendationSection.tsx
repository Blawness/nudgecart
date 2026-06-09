"use client";

import { useQuery } from "@tanstack/react-query";
import { Leaf } from "lucide-react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApiSuccess } from "@/types";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  imageUrl: string;
  storeName: string;
  merchantId: string;
  isEcoFriendly: boolean;
  ecoLabel: string | null;
}

interface RecommendationSectionProps {
  userName: string;
  isAuthenticated?: boolean;
}

export function RecommendationSection({ userName, isAuthenticated = false }: RecommendationSectionProps) {
  const { data, isLoading } = useQuery<ApiSuccess<Product[]>>({
    queryKey: ["nudge-recommendations"],
    queryFn: async () => {
      const res = await fetch("/api/nudge/recommendations");
      if (!res.ok) throw new Error("Gagal memuat rekomendasi");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: ecoData, isLoading: ecoLoading } = useQuery<ApiSuccess<Product[]>>({
    queryKey: ["nudge-recommendations-eco"],
    queryFn: async () => {
      const res = await fetch("/api/nudge/recommendations?type=eco");
      if (!res.ok) throw new Error("Gagal memuat rekomendasi eco");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) return null;

  const products = data?.data ?? [];
  const ecoProducts = ecoData?.data ?? [];

  if (!isLoading && products.length === 0 && !ecoLoading && ecoProducts.length === 0) return null;

  return (
    <div className="space-y-8" data-testid="recommendation-section">
      {isLoading ? (
        <div>
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        </div>
      ) : products.length > 0 ? (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-bold">Pilihan untuk {userName}</h2>
            <span className="text-xs text-muted-foreground">Berdasarkan preferensi kamu</span>
          </div>
          <ProductGrid products={products as Product[]} />
        </div>
      ) : null}

      {ecoLoading ? (
        <div>
          <Skeleton className="h-6 w-64 mb-4" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        </div>
      ) : ecoProducts.length > 0 ? (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Leaf className="size-5 text-green-600" />
            <h2 className="text-lg font-bold">Produk Ramah Lingkungan Untukmu</h2>
          </div>
          <ProductGrid products={ecoProducts as Product[]} />
        </div>
      ) : null}
    </div>
  );
}
