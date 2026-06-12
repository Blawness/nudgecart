"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
  Tags,
  Boxes,
  BarChart3,
  ImageIcon,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  { href: "/admin/banners", label: "Banner", icon: <ImageIcon className="size-4" /> },
  { href: "/admin/nudge", label: "Nudge Analytics", icon: <BarChart3 className="size-4" /> },
];

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = role === "MERCHANT" ? merchantLinks : adminLinks;
  const title = role === "MERCHANT" ? "Merchant" : "Admin";

  const renderLinks = (onNavigate?: () => void) =>
    links.map((link) => (
      <Link
        key={link.href}
        href={link.href}
        onClick={onNavigate}
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
    ));

  return (
    <>
      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-b bg-background px-4 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            aria-label="Buka menu navigasi"
            className="flex size-9 items-center justify-center rounded-lg border text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="border-b px-4 py-3">
              <SheetTitle className="text-left text-base font-bold text-primary">
                NudgeCart {title}
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 p-3">
              {renderLinks(() => setOpen(false))}
            </nav>
          </SheetContent>
        </Sheet>
        <span className="text-base font-bold text-primary">
          NudgeCart {title}
        </span>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-56 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-1 flex-col border-r bg-background">
          <div className="flex h-14 items-center border-b px-4 text-base font-bold text-primary">
            NudgeCart {title}
          </div>
          <nav className="flex-1 space-y-1 p-3">{renderLinks()}</nav>
        </div>
      </aside>
    </>
  );
}
