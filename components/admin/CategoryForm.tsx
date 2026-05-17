"use client"

import React from "react"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  useForm,
} from "@/components/ui/form"
import { generateSlug } from "@/lib/utils"
import { UploadDropzone } from "@/lib/uploadthing-client"
import Image from "next/image"

const categorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi"),
  slug: z.string().min(1, "Slug wajib diisi"),
  iconUrl: z.string().optional(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface Category {
  id: string
  name: string
  slug: string
  iconUrl?: string | null
}

interface CategoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category | null
  onSuccess?: () => void
}

export function CategoryForm({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CategoryFormProps) {
  const isEdit = !!category

  const defaultValues: CategoryFormValues = {
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    iconUrl: category?.iconUrl ?? "",
  }

  const form = useForm(categorySchema, defaultValues)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const onSubmit = async (data: CategoryFormValues) => {
    setIsSubmitting(true)
    try {
      const url = isEdit
        ? `/api/admin/categories/${category!.id}`
        : "/api/admin/categories"
      const method = isEdit ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          slug: data.slug,
          iconUrl: data.iconUrl,
        }),
      })

      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ error: "Gagal menyimpan kategori" }))
        throw new Error(err.error ?? "Gagal menyimpan kategori")
      }

      toast.success(isEdit ? "Kategori berhasil diperbarui" : "Kategori berhasil dibuat")
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    form.setValue("name", name as never)
    if (!isEdit) {
      form.setValue("slug", generateSlug(name) as never)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Kategori" : "Tambah Kategori"}
          </DialogTitle>
        </DialogHeader>
        <Form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField name="name" error={form.getError("name")}>
            <FormItem>
              <FormLabel>Nama Kategori</FormLabel>
              <FormControl>
                <Input
                  placeholder="Contoh: Sayuran"
                  value={String(form.values.name ?? "")}
                  onChange={handleNameChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField name="slug" error={form.getError("slug")}>
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input
                  placeholder="sayuran-abc"
                  {...form.register("slug")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <div className="space-y-2">
            <FormLabel>Icon Kategori</FormLabel>
            {form.values.iconUrl ? (
              <div className="relative aspect-square w-20 overflow-hidden rounded-lg border">
                <Image
                  src={form.values.iconUrl}
                  alt="Icon preview"
                  fill
                  unoptimized
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => form.setValue("iconUrl", "" as never)}
                  className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-white text-xs"
                >
                  ×
                </button>
              </div>
            ) : (
              <UploadDropzone
                endpoint="productImage"
                onClientUploadComplete={(res) => {
                  const url = res[0]?.url;
                  if (url) form.setValue("iconUrl", url as never);
                }}
                onUploadError={(error) => {
                  toast.error(error.message);
                }}
              />
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
