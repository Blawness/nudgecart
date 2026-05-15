"use client"

import React from "react"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  useForm,
} from "@/components/ui/form"

const productSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi"),
  description: z.string().optional(),
  price: z
    .number({ error: "Harga wajib diisi" })
    .positive("Harga harus lebih dari 0"),
  stock: z
    .number({ error: "Stok wajib diisi" })
    .min(0, "Stok tidak boleh negatif"),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
})

type ProductFormValues = z.infer<typeof productSchema>

interface Category {
  id: string
  name: string
  slug?: string
}

interface ProductFormProps {
  product?: {
    id: string
    name: string
    description?: string | null
    price: number
    stock: number
    categoryId: string
    images?: string[]
  } | null
  categories: Category[]
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter()
  const isEdit = !!product

  const defaultValues: ProductFormValues = {
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price ?? 0,
    stock: product?.stock ?? 0,
    categoryId: product?.categoryId ?? "",
  }

  const form = useForm(productSchema, defaultValues)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [imageUrls, setImageUrls] = React.useState<string[]>(
    product?.images ?? ["", "", "", "", ""]
  )

  const updateImageUrl = (index: number, value: string) => {
    setImageUrls((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true)
    try {
      const body = JSON.stringify({
        ...data,
        images: imageUrls.filter(Boolean),
      })
      const url = isEdit
        ? `/api/merchant/products/${product!.id}`
        : "/api/merchant/products"
      const method = isEdit ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      })

      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ error: "Gagal menyimpan produk" }))
        throw new Error(err.error ?? "Gagal menyimpan produk")
      }

      toast.success(isEdit ? "Produk berhasil diperbarui" : "Produk berhasil dibuat")
      router.push("/merchant/products")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form onSubmit={form.handleSubmit(onSubmit)}>
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
              <Input
                type="number"
                min={0}
                placeholder="0"
                {...form.register("price")}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="stock" error={form.getError("stock")}>
          <FormItem>
            <FormLabel>Stok</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={0}
                placeholder="0"
                {...form.register("stock")}
              />
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
              onValueChange={(val) =>
                form.setValue("categoryId", val as unknown as never)
              }
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

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Gambar Produk (URL)</span>
        {imageUrls.map((url, i) => (
          <Input
            key={i}
            placeholder={`URL Gambar ${i + 1}`}
            value={url}
            onChange={(e) => updateImageUrl(i, e.target.value)}
          />
        ))}
        <p className="text-xs text-muted-foreground">
          Masukkan URL gambar (maksimal 5)
        </p>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting
          ? "Menyimpan..."
          : isEdit
            ? "Perbarui Produk"
            : "Tambah Produk"}
      </Button>
    </Form>
  )
}
