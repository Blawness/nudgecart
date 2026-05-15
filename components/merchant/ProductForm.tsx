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
import { Label } from "@/components/ui/label"

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
  isEcoFriendly: z.boolean().optional(),
  ecoLabel: z.string().optional(),
  ecoTooltip: z.string().optional(),
  carbonFootprint: z.string().optional(),
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
    isEcoFriendly?: boolean | null
    ecoLabel?: string | null
    ecoTooltip?: string | null
    carbonFootprint?: number | null
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
    isEcoFriendly: product?.isEcoFriendly ?? false,
    ecoLabel: product?.ecoLabel ?? "",
    ecoTooltip: product?.ecoTooltip ?? "",
    carbonFootprint: product?.carbonFootprint?.toString() ?? "",
  }

  const form = useForm(productSchema, defaultValues)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isEco, setIsEco] = React.useState(!!product?.isEcoFriendly)
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

      <div className="border-t pt-4 mt-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-sm font-medium">Produk Ramah Lingkungan</span>
            <p className="text-xs text-muted-foreground">
              Tandai jika produk ini eco-friendly
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isEco}
            onClick={() => {
              setIsEco(!isEco)
              form.setValue("isEcoFriendly", !isEco as never)
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isEco ? "bg-green-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                isEco ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {isEco && (
          <div className="space-y-3 pl-1">
            <div>
              <Label>Eco Label</Label>
              <Select
                value={form.values.ecoLabel ?? ""}
                onValueChange={(val) =>
                  form.setValue("ecoLabel", val as never)
                }
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Pilih eco label" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FRESH">🌿 Produk Segar</SelectItem>
                  <SelectItem value="ECONOMICAL">💚 Pilihan Hemat &amp; Fresh</SelectItem>
                  <SelectItem value="POPULAR">🏆 Pilihan Terpopuler</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tooltip Eco Label</Label>
              <Input
                placeholder="Jelaskan kenapa produk ini eco-friendly"
                value={form.values.ecoTooltip ?? ""}
                onChange={(e) =>
                  form.setValue("ecoTooltip", e.target.value as never)
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label>Carbon Footprint (kg CO₂)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.5"
                value={form.values.carbonFootprint ?? ""}
                onChange={(e) =>
                  form.setValue("carbonFootprint", e.target.value as never)
                }
                className="mt-1"
              />
            </div>
          </div>
        )}
      </div>

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
