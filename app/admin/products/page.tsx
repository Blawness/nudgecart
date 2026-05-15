"use client";

import React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Package, Search, Store, Tag, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { formatRupiah } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  isActive: boolean;
  createdAt: string;
  imageUrl: string | null;
  category: { id: string; name: string; slug: string };
  merchant: { id: string; storeName: string };
}

interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const { data, isLoading } = useQuery<ProductsResponse>({
    queryKey: ["admin-products", search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/admin/products?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal memuat data produk");
      return res.json();
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch(`/api/merchant/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error("Gagal mengubah status produk");
    },
    onSuccess: () => {
      toast.success("Status produk diperbarui");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui status");
    },
  });

  const products = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Produk</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola semua produk dari seluruh merchant
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: "all", label: "Semua" },
            { value: "active", label: "Aktif" },
            { value: "inactive", label: "Nonaktif" },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === filter.value
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Package className="size-4" />
        <span>{total} produk ditemukan</span>
      </div>

      {/* Table */}
      <div className="mt-4">
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Belum ada produk</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Data produk akan muncul setelah merchant menambahkan produk
            </p>
          </div>
        ) : (
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Gambar</TableHead>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link
                        href={`/products/${product.slug}`}
                        className="hover:text-primary hover:underline"
                        target="_blank"
                      >
                        {product.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Store className="size-3 text-muted-foreground" />
                        <Link
                          href={`/merchants/${product.merchant.id}`}
                          className="hover:text-primary hover:underline"
                          target="_blank"
                        >
                          {product.merchant.storeName}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Tag className="size-3 text-muted-foreground" />
                        <Link
                          href={`/categories/${product.category.slug}`}
                          className="hover:text-primary hover:underline"
                          target="_blank"
                        >
                          {product.category.name}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>{formatRupiah(product.price)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      {product.isActive ? (
                        <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">Aktif</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-100">Nonaktif</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          render={<Link href={`/admin/products/${product.id}/edit`} />}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={product.isActive ? "text-destructive" : "text-primary"}
                          disabled={toggleMutation.isPending}
                          onClick={() => {
                            if (window.confirm(`${product.isActive ? "Nonaktifkan" : "Aktifkan"} produk "${product.name}"?`)) {
                              toggleMutation.mutate({
                                id: product.id,
                                isActive: !product.isActive,
                              });
                            }
                          }}
                        >
                          {product.isActive ? "Nonaktifkan" : "Aktifkan"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
