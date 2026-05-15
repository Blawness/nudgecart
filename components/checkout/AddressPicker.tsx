"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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

interface AddressPickerProps {
  value: string | null;
  onChange: (addressId: string) => void;
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

export function AddressPicker({ value, onChange }: AddressPickerProps) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const res = await fetch("/api/user/addresses");
      if (!res.ok) throw new Error("Gagal memuat alamat");
      const json = await res.json();
      return json.data as Address[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newAddress: Omit<Address, "id">) => {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress),
      });
      if (!res.ok) throw new Error("Gagal menambah alamat");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setDialogOpen(false);
      setForm(emptyForm);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  const handleFieldChange = (field: keyof typeof form, val: string) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const addresses = data ?? [];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-base font-medium">Alamat Pengiriman</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button variant="outline" size="sm">
                <Plus className="size-3.5" />
                Tambah Alamat Baru
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Alamat Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
                  onChange={(e) =>
                    handleFieldChange("province", e.target.value)
                  }
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
                  disabled={createMutation.isPending}
                  className="w-full"
                >
                  {createMutation.isPending ? "Menyimpan..." : "Simpan Alamat"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-2">
                <div className="animate-pulse rounded-md bg-muted h-4 w-1/3" />
                <div className="animate-pulse rounded-md bg-muted h-3 w-2/3" />
                <div className="animate-pulse rounded-md bg-muted h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Belum ada alamat tersimpan
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {addresses.map((addr) => (
            <Card
              key={addr.id}
              className={cn(
                "cursor-pointer transition-colors hover:bg-muted/50",
                value === addr.id && "ring-2 ring-primary"
              )}
              onClick={() => onChange(addr.id)}
            >
              <CardContent>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border">
                    {value === addr.id && (
                      <div className="size-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{addr.label}</span>
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
