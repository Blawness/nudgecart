"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

const merchantRegisterSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().min(1, "Email wajib diisi").email("Email tidak valid"),
  storeName: z.string().min(1, "Nama toko wajib diisi"),
  storeDescription: z.string().min(1, "Deskripsi toko wajib diisi"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export default function MerchantRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = merchantRegisterSchema.safeParse({
      name,
      email,
      storeName,
      storeDescription,
      password,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register/merchant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Pendaftaran gagal");
        return;
      }

      toast.success("Pendaftaran berhasil. Tunggu approval admin.");
      router.push("/login");
    } catch {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Daftar sebagai Merchant</CardTitle>
          <CardDescription>
            Buka toko kamu di Pasarku
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                type="text"
                placeholder="Nama kamu"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="storeName">Nama Toko</Label>
              <Input
                id="storeName"
                type="text"
                placeholder="Toko Sayur Segar"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
              {errors.storeName && (
                <p className="text-xs text-destructive">{errors.storeName}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="storeDescription">Deskripsi Toko</Label>
              <Textarea
                id="storeDescription"
                placeholder="Deskripsikan toko kamu..."
                value={storeDescription}
                onChange={(e) => setStoreDescription(e.target.value)}
              />
              {errors.storeDescription && (
                <p className="text-xs text-destructive">
                  {errors.storeDescription}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Memproses..." : "Daftar sebagai Merchant"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Masuk
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
