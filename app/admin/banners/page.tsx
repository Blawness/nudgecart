"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, GripVertical, ArrowLeft } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  link: string;
  bgColor: string;
  textColor: string;
  order: number;
  isActive: boolean;
}

export function BannerForm({
  banner,
  onClose,
}: {
  banner?: Banner | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = React.useState({
    title: banner?.title ?? "",
    subtitle: banner?.subtitle ?? "",
    imageUrl: banner?.imageUrl ?? "",
    link: banner?.link ?? "/promo",
    bgColor: banner?.bgColor ?? "#dc2626",
    textColor: banner?.textColor ?? "#ffffff",
    order: banner?.order ?? 0,
    isActive: banner?.isActive ?? true,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const url = banner ? `/api/banners/${banner.id}` : "/api/banners";
      const method = banner ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Gagal menyimpan banner");
      return res.json();
    },
    onSuccess: () => {
      toast.success(banner ? "Banner diperbarui" : "Banner dibuat");
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label>Judul</Label>
        <Input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="PROMO HEMAT"
        />
      </div>
      <div className="grid gap-2">
        <Label>Subjudul</Label>
        <Input
          value={form.subtitle}
          onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          placeholder="Diskon hingga 40%"
        />
      </div>
      <div className="grid gap-2">
        <Label>URL Gambar (1200x260)</Label>
        <Input
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          placeholder="https://..."
        />
      </div>
      <div className="grid gap-2">
        <Label>Link</Label>
        <Input
          value={form.link}
          onChange={(e) => setForm({ ...form, link: e.target.value })}
          placeholder="/promo"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Warna Background</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={form.bgColor}
              onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
              className="w-12 p-1"
            />
            <Input
              value={form.bgColor}
              onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
              className="flex-1"
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Warna Teks</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={form.textColor}
              onChange={(e) => setForm({ ...form, textColor: e.target.value })}
              className="w-12 p-1"
            />
            <Input
              value={form.textColor}
              onChange={(e) => setForm({ ...form, textColor: e.target.value })}
              className="flex-1"
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Urutan</Label>
          <Input
            type="number"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
          />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            id="isActive"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            className="size-5 rounded border-gray-300"
          />
          <Label htmlFor="isActive" className="cursor-pointer">
            Aktif
          </Label>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onClose}
        >
          Batal
        </Button>
        <Button
          type="button"
          className="flex-1"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !form.title || !form.imageUrl}
        >
          {mutation.isPending ? "Menyimpan..." : banner ? "Update" : "Tambah"}
        </Button>
      </div>
    </div>
  );
}

export default function AdminBannersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editingBanner, setEditingBanner] = React.useState<Banner | null>(null);
  const [showForm, setShowForm] = React.useState(false);

  const { data, isLoading } = useQuery<{ data: Banner[] }>({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const res = await fetch("/api/banners");
      if (!res.ok) throw new Error("Gagal memuat banner");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/banners/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus banner");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Banner dihapus");
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const banners = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin")}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-2xl font-bold">Kelola Banner</h1>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditingBanner(null);
            setShowForm(true);
          }}
        >
          <Plus className="size-4 mr-1" />
          Tambah Banner
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">
            {editingBanner ? "Edit Banner" : "Tambah Banner"}
          </h2>
          <BannerForm
            banner={editingBanner}
            onClose={() => setShowForm(false)}
          />
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-10 text-gray-400">Memuat...</div>
      ) : banners.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
          <p className="text-gray-500">Belum ada banner</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Urut</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Preview</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Judul</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Link</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {banners.map((banner) => (
                <tr key={banner.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">
                    <GripVertical className="size-4 inline mr-1" />
                    {banner.order}
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative h-12 w-32 overflow-hidden rounded-lg bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{banner.title}</div>
                    <div className="text-xs text-gray-500">{banner.subtitle}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{banner.link}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        banner.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {banner.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingBanner(banner);
                          setShowForm(true);
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          if (confirm("Yakin hapus banner ini?")) {
                            deleteMutation.mutate(banner.id);
                          }
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
