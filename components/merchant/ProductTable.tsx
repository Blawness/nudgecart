"use client"

import React from "react"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { PencilIcon, Trash2Icon, PackageIcon } from "lucide-react"
import { formatRupiah } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableSkeleton } from "@/components/shared/LoadingSkeleton"

interface Product {
  id: string
  name: string
  price: number
  stock: number
  isActive: boolean
  images?: string[]
  categoryId?: string
}

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("/api/merchant/products")
  if (!res.ok) throw new Error("Gagal memuat produk")
  const json = await res.json()
  return json.data ?? json
}

async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`/api/merchant/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive: false }),
  })
  if (!res.ok) throw new Error("Gagal menghapus produk")
}

export function ProductTable() {
  const queryClient = useQueryClient()

  const { data: products, isLoading } = useQuery({
    queryKey: ["merchant-products"],
    queryFn: fetchProducts,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success("Produk dinonaktifkan")
      queryClient.invalidateQueries({ queryKey: ["merchant-products"] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus produk")
    },
  })

  if (isLoading) return <TableSkeleton rows={5} />

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <PackageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Belum ada produk</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Tambahkan produk pertama Anda untuk mulai berjualan
        </p>
        <Button className="mt-6" render={<Link href="/merchant/products/new" />}>
          Tambah Produk
        </Button>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Gambar</TableHead>
          <TableHead>Nama</TableHead>
          <TableHead>Harga</TableHead>
          <TableHead>Stok</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-32">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <PackageIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </TableCell>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell>{formatRupiah(product.price)}</TableCell>
            <TableCell>{product.stock}</TableCell>
            <TableCell>
              {product.isActive ? (
                <Badge variant="default">Aktif</Badge>
              ) : (
                <Badge variant="secondary">Nonaktif</Badge>
              )}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  render={<Link href={`/merchant/products/${product.id}/edit`} />}
                >
                  <PencilIcon />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
                  disabled={deleteMutation.isPending}
                  onClick={() => {
                    if (window.confirm("Nonaktifkan produk ini?")) {
                      deleteMutation.mutate(product.id)
                    }
                  }}
                >
                  <Trash2Icon />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
