"use client";

import React from "react";
import Image from "next/image";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X, ImageIcon } from "lucide-react";
import { UploadDropzone } from "@/lib/uploadthing-client";
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
          <label className="text-sm font-medium">Gambar Produk</label>

          {imageUrls.filter(Boolean).length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {imageUrls.map(
                (url, i) =>
                  url && (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border bg-muted group">
                      <Image
                        src={url}
                        alt={`Gambar ${i + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="33vw"
                      />
                      <button
                        type="button"
                        onClick={() => removeImageUrl(i)}
                        className="absolute top-1 right-1 size-5 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  )
              )}
            </div>
          )}

          {imageUrls.filter(Boolean).length < 5 && (
            <UploadDropzone
              endpoint="productImage"
              onClientUploadComplete={(res) => {
                const newUrls = res.map((f) => f.url)
                setImageUrls((prev) => {
                  const filtered = prev.filter(Boolean)
                  return [...filtered, ...newUrls].slice(0, 5)
                })
                toast.success("Gambar berhasil diupload")
              }}
              onUploadError={(error) => {
                toast.error(error.message)
              }}
            />
          )}

          <p className="text-xs text-muted-foreground">
            Upload atau paste URL gambar (maksimal 5)
          </p>

          <div className="flex gap-2">
            <Input
              placeholder="Atau paste URL gambar..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  const val = e.currentTarget.value.trim()
                  if (!val) return
                  setImageUrls((prev) => [...prev.filter(Boolean), val].slice(0, 5))
                  e.currentTarget.value = ""
                }
              }}
            />
          </div>
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
