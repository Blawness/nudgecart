"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, Search, User, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/hooks/useCart";

export function Navbar() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const role = session?.user?.role;

  const { items } = useCart({ enabled: !!session });

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-1.5 text-lg font-extrabold tracking-tight text-primary"
          >
            <ShoppingBag className="size-6" />
            <span>NudgeCart</span>
          </Link>

          {/* Search — desktop only */}
          <form
            className="hidden flex-1 justify-center sm:flex"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const q = fd.get("q")?.toString().trim();
              if (q) router.push(`/?q=${encodeURIComponent(q)}`);
            }}
          >
            <div className="relative flex w-full max-w-xl">
              <Input
                name="q"
                type="search"
                placeholder="Temukan produk favoritmu disini"
                className="h-9 rounded-l-full rounded-r-none border-r-0 border-gray-200 bg-gray-50 pr-0 text-sm text-gray-800 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <button
                type="submit"
                className="flex h-9 items-center justify-center rounded-r-full bg-primary px-5 text-white hover:bg-primary/90"
              >
                <Search className="size-4" />
              </button>
            </div>
          </form>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Nav links — desktop */}
            <div className="hidden items-center gap-5 md:flex">
              <Link
                href="/"
                className="text-sm font-medium text-gray-600 hover:text-primary"
              >
                Home
              </Link>
              <Link
                href="/categories"
                className="text-sm font-medium text-gray-600 hover:text-primary"
              >
                Kategori
              </Link>
              <Link
                href="/promo"
                className="text-sm font-medium text-gray-600 hover:text-primary"
              >
                Promo
              </Link>
            </div>

            {/* Cart — desktop only */}
            <Link href="/cart" className="relative hidden sm:inline-flex">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-700 hover:bg-gray-100"
              >
                <ShoppingCart className="size-5" />
                <span className="sr-only">Keranjang</span>
              </Button>
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white leading-none pointer-events-none">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* User — desktop only */}
            <div className="hidden sm:flex items-center gap-2">
              {status === "loading" ? (
                <div className="size-8 animate-pulse rounded-full bg-gray-200" />
              ) : session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-700 hover:bg-gray-100"
                      />
                    }
                  >
                    <User className="size-5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="truncate px-2 py-1.5 text-sm font-medium">
                      {session.user?.name}
                    </div>
                    <DropdownMenuSeparator />
                    {role === "BUYER" && (
                      <>
                        <DropdownMenuItem render={<Link href="/orders" />}>
                          Pesanan Saya
                        </DropdownMenuItem>
                        <DropdownMenuItem render={<Link href="/profile" />}>
                          Profil
                        </DropdownMenuItem>
                      </>
                    )}
                    {role === "MERCHANT" && (
                      <DropdownMenuItem
                        render={<Link href="/merchant/dashboard" />}
                      >
                        Dashboard Merchant
                      </DropdownMenuItem>
                    )}
                    {role === "ADMIN" && (
                      <DropdownMenuItem render={<Link href="/admin" />}>
                        Dashboard Admin
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      Keluar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    className="text-sm text-gray-600 hover:bg-gray-100 hover:text-primary"
                    render={<Link href="/login" />}
                  >
                    Masuk
                  </Button>
                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-white text-sm font-semibold"
                    render={<Link href="/register" />}
                  >
                    Daftar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
