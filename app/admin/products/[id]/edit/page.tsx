"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PackageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { AdminProductForm } from "@/components/admin/AdminProductForm";

interface Category {
  id: string;
  name: string;
  slug?: string;
}

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  categoryId: string;
  isActive: boolean;
  images?: string[];
  merchant?: { storeName: string } | null;
}

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch("/api/categories");
  if (!res.ok) throw new Error("Gagal memuat kategori");
  const json = await res.json();
  return json.data ?? json;
}

async function fetchProduct(id: string): Promise<Product> {
  const res = await fetch(`/api/admin/products/${id}`);
  if (!res.ok) throw new Error("Gagal memuat produk");
  const json = await res.json();
  return json.data;
}

export default function AdminEditProductPage() {
  const params = useParams();
  const productId = params.id as string;

  const {
    data: product,
    isLoading: productLoading,
    error: productError,
  } = useQuery({
    queryKey: ["admin-product", productId],
    queryFn: () => fetchProduct(productId),
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  if (productLoading || categoriesLoading) return <TableSkeleton rows={4} />;

  if (productError || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <PackageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Produk tidak ditemukan</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Produk yang Anda cari tidak ditemukan di database
        </p>
        <Button className="mt-6" render={<Link href="/admin/products" />}>
          Kembali ke Daftar Produk
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Edit Produk</h2>
        {product.merchant && (
          <p className="mt-1 text-sm text-muted-foreground">
            Merchant: <span className="font-medium">{product.merchant.storeName}</span>
          </p>
        )}
      </div>
      <AdminProductForm product={product} categories={categories ?? []} />
    </div>
  );
}
