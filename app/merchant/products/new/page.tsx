"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductForm } from "@/components/merchant/ProductForm";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";

interface Category {
  id: string;
  name: string;
  slug?: string;
}

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch("/api/categories");
  if (!res.ok) throw new Error("Gagal memuat kategori");
  const json = await res.json();
  return json.data ?? json;
}

export default function NewProductPage() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  if (isLoading) return <TableSkeleton rows={4} />;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h2 className="text-xl font-semibold">Tambah Produk Baru</h2>
      <ProductForm categories={categories ?? []} />
    </div>
  );
}
