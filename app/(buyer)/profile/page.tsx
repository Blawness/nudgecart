"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  ShoppingBag,
  Receipt,
  Package,
  Settings,
  Star,
  ShieldCheck,
  HelpCircle,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/lib/utils";

interface Address {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
}

const emptyForm = {
  label: "",
  recipientName: "",
  phone: "",
  street: "",
  city: "",
  province: "",
  postalCode: "",
};

const accountMenuItems = [
  { label: "Account Settings", icon: Settings },
  { label: "Ratings & Reviews", icon: Star },
  { label: "Application Permissions", icon: ShieldCheck },
  { label: "Help Center", icon: HelpCircle },
];

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const queryClient = useQueryClient();

  const [name, setName] = useState(session?.user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editAddressId, setEditAddressId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["user-stats"],
    queryFn: async () => {
      const res = await fetch("/api/user/stats");
      if (!res.ok) throw new Error("Gagal memuat statistik");
      const json = await res.json();
      return json.data as {
        totalOrders: number;
        totalSpent: number;
        totalItems: number;
        totalSaved: number;
        phone: string | null;
        memberSince: string | null;
      };
    },
  });

  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const res = await fetch("/api/user/addresses");
      if (!res.ok) throw new Error("Gagal memuat alamat");
      const json = await res.json();
      return json.data as Address[];
    },
  });

  const profileMutation = useMutation({
    mutationFn: async (data: { name: string; phone: string }) => {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Gagal memperbarui profil");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Profil berhasil diperbarui");
      updateSession();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const saveAddressMutation = useMutation({
    mutationFn: async (data: Omit<Address, "id">) => {
      const url = editAddressId
        ? `/api/user/addresses/${editAddressId}`
        : "/api/user/addresses";
      const method = editAddressId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Gagal menyimpan alamat");
      return res.json();
    },
    onSuccess: () => {
      toast.success(
        editAddressId ? "Alamat berhasil diperbarui" : "Alamat berhasil ditambahkan"
      );
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setDialogOpen(false);
      setEditAddressId(null);
      setForm(emptyForm);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (addressId: string) => {
      const res = await fetch(`/api/user/addresses/${addressId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus alamat");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Alamat berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    profileMutation.mutate({
      name: name || session?.user?.name || "",
      phone: phone || stats?.phone || "",
    });
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveAddressMutation.mutate(form);
  };

  const handleFieldChange = (field: keyof typeof emptyForm, val: string) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const openEditDialog = (addr: Address) => {
    setEditAddressId(addr.id);
    setForm({
      label: addr.label,
      recipientName: addr.recipientName,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      province: addr.province,
      postalCode: addr.postalCode,
    });
    setDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditAddressId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const firstAddressPhone = addresses?.[0]?.phone;
  const displayContact = stats?.phone || firstAddressPhone || session?.user?.email || "-";
  const memberSince = stats?.memberSince
    ? new Date(stats.memberSince).toLocaleDateString("id-ID", {
        month: "short",
        year: "numeric",
      })
    : "-";

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-heading mb-6 text-2xl font-semibold">Akun Saya</h1>

      <div className="flex flex-col gap-6">
        {/* User Summary Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                {session?.user?.name?.charAt(0).toUpperCase() ?? "B"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-lg font-semibold">
                  {session?.user?.name ?? "—"}
                  </p>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    NEWBIE
                  </span>
                </div>
                <p className="truncate text-sm text-muted-foreground">{displayContact}</p>
                <p className="text-xs text-muted-foreground">
                  Member since {memberSince}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex items-center justify-between gap-3 pt-5 pb-5">
            <div>
              <p className="text-sm font-medium text-green-800">
                Progress Belanja
              </p>
              <p className="text-xl font-bold text-green-900">
                Kamu sudah hemat {formatRupiah(stats?.totalSaved ?? 0)}
              </p>
            </div>
            <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-green-700">
              Hemat aktif
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="divide-y p-0">
            {accountMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-muted"
                >
                  <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Icon className="size-4" />
                  </span>
                  <span className="flex-1 font-medium">{item.label}</span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Shopping Stats Section */}
        <div className="grid grid-cols-3 gap-3">
          {statsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="flex flex-col items-center gap-2 pt-5 pb-4">
                  <Skeleton className="size-8 rounded-full" />
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-3 w-16" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardContent className="flex flex-col items-center gap-1 pt-5 pb-4">
                  <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Receipt className="size-4" />
                  </div>
                  <p className="text-xl font-bold">{stats?.totalOrders ?? 0}</p>
                  <p className="text-center text-xs text-muted-foreground">Total Pesanan</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center gap-1 pt-5 pb-4">
                  <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ShoppingBag className="size-4" />
                  </div>
                  <p className="text-xl font-bold leading-tight">
                    {formatRupiah(stats?.totalSpent ?? 0)}
                  </p>
                  <p className="text-center text-xs text-muted-foreground">Total Belanja</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center gap-1 pt-5 pb-4">
                  <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Package className="size-4" />
                  </div>
                  <p className="text-xl font-bold">{stats?.totalItems ?? 0}</p>
                  <p className="text-center text-xs text-muted-foreground">Total Item</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi Akun</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleProfileSubmit}
              className="flex flex-col gap-3"
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={session?.user?.email ?? ""}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Nama</Label>
                <Input
                  id="name"
                  value={name || session?.user?.name || ""}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone">Nomor Telepon</Label>
                <Input
                  id="phone"
                  placeholder="08123456789"
                  value={phone || stats?.phone || ""}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                disabled={profileMutation.isPending}
                className="self-start"
              >
                {profileMutation.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Daftar Alamat</CardTitle>
            <Button variant="outline" size="sm" onClick={openAddDialog}>
              <Plus className="size-3.5" />
              Tambah Alamat
            </Button>
          </CardHeader>
          <CardContent>
            {addressesLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-2 rounded-lg border p-3">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : (addresses ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada alamat tersimpan
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {(addresses ?? []).map((addr) => (
                  <div
                    key={addr.id}
                    className="flex items-start justify-between rounded-lg border p-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {addr.label}
                        </span>
                        <span className="text-sm">{addr.recipientName}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {addr.phone}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {addr.street}, {addr.city}, {addr.province},{" "}
                        {addr.postalCode}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => openEditDialog(addr)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-destructive hover:text-destructive"
                        disabled={deleteAddressMutation.isPending}
                        onClick={() => deleteAddressMutation.mutate(addr.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editAddressId ? "Edit Alamat" : "Tambah Alamat Baru"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddressSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                placeholder="Rumah / Kantor"
                value={form.label}
                onChange={(e) => handleFieldChange("label", e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="recipientName">Nama Penerima</Label>
              <Input
                id="recipientName"
                placeholder="Nama penerima"
                value={form.recipientName}
                onChange={(e) =>
                  handleFieldChange("recipientName", e.target.value)
                }
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input
                id="phone"
                placeholder="08123456789"
                value={form.phone}
                onChange={(e) => handleFieldChange("phone", e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="street">Alamat Lengkap</Label>
              <Input
                id="street"
                placeholder="Jalan, nomor, RT/RW"
                value={form.street}
                onChange={(e) => handleFieldChange("street", e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="city">Kota / Kabupaten</Label>
              <Input
                id="city"
                placeholder="Kota"
                value={form.city}
                onChange={(e) => handleFieldChange("city", e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="province">Provinsi</Label>
              <Input
                id="province"
                placeholder="Provinsi"
                value={form.province}
                onChange={(e) => handleFieldChange("province", e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="postalCode">Kode Pos</Label>
              <Input
                id="postalCode"
                placeholder="12345"
                value={form.postalCode}
                onChange={(e) =>
                  handleFieldChange("postalCode", e.target.value)
                }
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={saveAddressMutation.isPending}
                className="w-full"
              >
                {saveAddressMutation.isPending
                  ? "Menyimpan..."
                  : editAddressId
                    ? "Simpan Perubahan"
                    : "Simpan Alamat"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
