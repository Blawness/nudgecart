"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, MessageCircle, ShoppingCart, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";

interface Tab {
  label: string;
  icon: React.ElementType;
  href: string;
  showBadge?: boolean;
  disabled?: boolean;
}

const tabs: Tab[] = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Kategori", icon: LayoutGrid, href: "/categories" },
  { label: "Chat CS", icon: MessageCircle, href: "#", disabled: true },
  { label: "Keranjang", icon: ShoppingCart, href: "/cart", showBadge: true },
  { label: "Akun", icon: User, href: "/profile" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const { items } = useCart({ enabled: !!session });

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white border-t border-gray-100 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <div className="grid grid-cols-5 h-16">
        {tabs.map((tab) => {
          const isActive =
            !tab.disabled &&
            (tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href));

          const href =
            tab.label === "Akun" && !session ? "/login" : tab.href;

          return (
            <Link
              key={tab.label}
              href={tab.disabled ? "#" : href}
              aria-disabled={tab.disabled}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 transition-colors",
                tab.disabled && "pointer-events-none opacity-40",
                isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <div className="relative">
                <tab.icon
                  className={cn("size-[22px]", isActive && "stroke-[2.5px]")}
                />
                {tab.showBadge && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex min-w-[16px] h-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white leading-none">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium leading-tight",
                  isActive ? "text-primary" : "text-gray-400"
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
