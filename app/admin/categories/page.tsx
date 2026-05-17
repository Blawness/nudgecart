"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Tags } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";

interface Category {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string | null;
  productCount?: number;
}

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch("/api/categories");
  if (!res.ok) throw new Error("Gagal memuat data kategori");
  const json = await res.json();
  return json.data ?? json;
}

async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Gagal menghapus kategori" }));
    throw new Error(err.error ?? "Gagal menghapus kategori");
  }
}

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Category | null>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success("Kategori berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus kategori");
    },
  });

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormOpen(true);
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kategori</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola kategori produk
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCategory(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Tambah Kategori
        </Button>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : !categories || categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Tags className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Belum ada kategori</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Buat kategori pertama untuk mulai mengelompokkan produk
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Icon</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Jumlah Produk</TableHead>
                <TableHead className="w-24">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    {category.iconUrl ? (
                      <div className="relative size-10 overflow-hidden rounded-lg">
                        <Image
                          src={category.iconUrl}
                          alt={category.name}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                        <Tags className="size-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                  <TableCell>{category.productCount ?? 0}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleEdit(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(category)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <CategoryForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingCategory(null);
        }}
        category={editingCategory}
        onSuccess={handleFormSuccess}
      />

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Kategori</DialogTitle>
            <DialogDescription>
              Anda yakin ingin menghapus kategori &quot;{deleteTarget?.name}&quot;?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
