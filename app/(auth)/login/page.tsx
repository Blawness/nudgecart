"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse({ email, password });
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
      const res = await signIn("credentials", {
        email: result.data.email,
        password: result.data.password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Email atau password salah");
        return;
      }

      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const role = session?.user?.role;

      toast.success("Berhasil masuk");
      router.refresh();

      if (role === "ADMIN") {
        router.push("/admin");
      } else if (role === "MERCHANT") {
        router.push("/merchant/dashboard");
      } else {
        router.push("/");
      }
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
          <CardTitle>Masuk</CardTitle>
          <CardDescription>
            Masuk ke akun Pasarku kamu
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
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
              {loading ? "Memproses..." : "Masuk"}
            </Button>
            <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
              <span>
                Belum punya akun?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Daftar
                </Link>
              </span>
              <Link
                href="/register/merchant"
                className="text-primary hover:underline"
              >
                Daftar sebagai Merchant
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
