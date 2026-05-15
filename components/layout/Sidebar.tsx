"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
  Tags,
  Boxes,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

interface SidebarProps {
  role: Exclude<UserRole, "BUYER">;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const merchantLinks: NavItem[] = [
  { href: "/merchant/dashboard", label: "Dashboard", icon: <LayoutDashboard className="size-4" /> },
  { href: "/merchant/products", label: "Produk Saya", icon: <Package className="size-4" /> },
  { href: "/merchant/orders", label: "Pesanan", icon: <ShoppingBag className="size-4" /> },
];

const adminLinks: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="size-4" /> },
  { href: "/admin/products", label: "Produk", icon: <Boxes className="size-4" /> },
  { href: "/admin/merchants", label: "Merchant", icon: <Store className="size-4" /> },
  { href: "/admin/categories", label: "Kategori", icon: <Tags className="size-4" /> },
  { href: "/admin/orders", label: "Pesanan", icon: <ShoppingBag className="size-4" /> },
];

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const links = role === "MERCHANT" ? merchantLinks : adminLinks;

  return (
    <aside className="hidden md:flex md:w-56 md:flex-col md:fixed md:inset-y-0 md:pt-14">
      <div className="flex flex-col flex-1 border-r bg-background">
        <nav className="flex-1 space-y-1 p-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
