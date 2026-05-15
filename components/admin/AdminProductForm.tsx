"use client";

import React from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  useForm,
} from "@/components/ui/form";

const productSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi"),
  description: z.string().optional(),
  price: z.number({ error: "Harga wajib diisi" }).positive("Harga harus lebih dari 0"),
  stock: z.number({ error: "Stok wajib diisi" }).min(0, "Stok tidak boleh negatif"),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  isActive: z.boolean().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface Category {
  id: string;
  name: string;
  slug?: string;
}

interface AdminProductFormProps {
  product: {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    stock: number;
    categoryId: string;
    isActive: boolean;
    images?: string[];
  };
  categories: Category[];
}

export function AdminProductForm({ product, categories }: AdminProductFormProps) {
  const router = useRouter();

  const defaultValues: ProductFormValues = {
    name: product.name,
    description: product.description ?? "",
    price: product.price,
    stock: product.stock,
    categoryId: product.categoryId,
    isActive: product.isActive,
  };

  const form = useForm(productSchema, defaultValues);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [imageUrls, setImageUrls] = React.useState<string[]>(
    product.images && product.images.length > 0
      ? [...product.images, ""]
      : [""]
  );

  const updateImageUrl = (index: number, value: string) => {
    setImageUrls((prev) => {
      const next = [...prev];
      next[index] = value;
      // Add empty field if last one is filled
      if (index === next.length - 1 && value && next.length < 5) {
        next.push("");
      }
      return next;
    });
  };

  const removeImageUrl = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      const filteredImages = imageUrls.filter(Boolean);
      const body = JSON.stringify({
        ...data,
        imageUrls: filteredImages.length > 0 ? filteredImages : undefined,
      });

      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Gagal menyimpan produk" }));
        throw new Error(err.error ?? "Gagal menyimpan produk");
      }

      toast.success("Produk berhasil diperbarui");
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <FormField name="name" error={form.getError("name")}>
          <FormItem>
            <FormLabel>Nama Produk</FormLabel>
            <FormControl>
              <Input placeholder="Nama produk" {...form.register("name")} />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="description" error={form.getError("description")}>
          <FormItem>
            <FormLabel>Deskripsi</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Deskripsi produk"
                rows={4}
                {...form.register("description")}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField name="price" error={form.getError("price")}>
            <FormItem>
              <FormLabel>Harga (Rp)</FormLabel>
              <FormControl>
                <Input type="number" min={0} placeholder="0" {...form.register("price")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField name="stock" error={form.getError("stock")}>
            <FormItem>
              <FormLabel>Stok</FormLabel>
              <FormControl>
                <Input type="number" min={0} placeholder="0" {...form.register("stock")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <FormField name="categoryId" error={form.getError("categoryId")}>
          <FormItem>
            <FormLabel>Kategori</FormLabel>
            <FormControl>
              <Select
                value={String(form.values.categoryId ?? "")}
                onValueChange={(val) => form.setValue("categoryId", val as unknown as never)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="isActive">
          <FormItem className="flex items-center gap-3 rounded-lg border p-3">
            <FormControl>
              <input
                type="checkbox"
                id="isActive"
                checked={!!form.values.isActive}
                onChange={(e) => form.setValue("isActive", e.target.checked)}
                className="size-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
            </FormControl>
            <div>
              <FormLabel htmlFor="isActive" className="text-base cursor-pointer">
                Status Produk Aktif
              </FormLabel>
              <p className="text-sm text-muted-foreground">
                {form.values.isActive ? "Produk terlihat di toko" : "Produk disembunyikan"}
              </p>
            </div>
          </FormItem>
        </FormField>

        <div className="space-y-3">
          <label className="text-sm font-medium">Gambar Produk (URL)</label>
          {imageUrls.map((url, i) => (
            <div key={i} className="flex gap-2">
              <Input
                placeholder={`URL Gambar ${i + 1}`}
                value={url}
                onChange={(e) => updateImageUrl(i, e.target.value)}
                className="flex-1"
              />
              {imageUrls.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeImageUrl(i)}
                  className="shrink-0"
                >
                  Hapus
                </Button>
              )}
            </div>
          ))}
          {imageUrls.length < 5 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setImageUrls((prev) => [...prev, ""])}
            >
              + Tambah Gambar
            </Button>
          )}
          <p className="text-xs text-muted-foreground">Maksimal 5 gambar</p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/admin/products")}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </div>
    </Form>
  );
}
