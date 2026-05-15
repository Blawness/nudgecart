"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PackageIcon } from "lucide-react";
import { ProductForm } from "@/components/merchant/ProductForm";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
  images?: string[];
}

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch("/api/categories");
  if (!res.ok) throw new Error("Gagal memuat kategori");
  const json = await res.json();
  return json.data ?? json;
}

async function fetchProduct(id: string): Promise<Product> {
  const res = await fetch(`/api/merchant/products`);
  if (!res.ok) throw new Error("Gagal memuat produk");
  const json = await res.json();
  const products: Product[] = json.data ?? json;
  const product = products.find((p: Product) => p.id === id);
  if (!product) throw new Error("Produk tidak ditemukan");
  return product;
}

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;

  const {
    data: product,
    isLoading: productLoading,
    error: productError,
  } = useQuery({
    queryKey: ["merchant-product", productId],
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
          Produk yang Anda cari tidak ditemukan atau bukan milik Anda
        </p>
        <Button
          className="mt-6"
          render={<Link href="/merchant/products" />}
        >
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h2 className="text-xl font-semibold">Edit Produk</h2>
      <ProductForm product={product} categories={categories ?? []} />
    </div>
  );
}
