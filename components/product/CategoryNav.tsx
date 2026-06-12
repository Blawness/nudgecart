"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Apple,
  Carrot,
  Fish,
  CupSoda,
  Cookie,
  CookingPot,
  type LucideIcon,
} from "lucide-react";
import { useRef } from "react";
import type { ApiSuccess } from "@/types";

interface Category {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string | null;
}

// Per-category fallback icon + tint, keyed by slug, used when no iconUrl image
// has been uploaded for the category.
const categoryIconMap: Record<string, { icon: LucideIcon; className: string }> = {
  "buah-buahan": { icon: Apple, className: "text-rose-500" },
  sayuran: { icon: Carrot, className: "text-green-600" },
  "daging-ikan": { icon: Fish, className: "text-sky-600" },
  minuman: { icon: CupSoda, className: "text-amber-500" },
  "bumbu-dapur": { icon: CookingPot, className: "text-orange-600" },
  "snack-makanan-ringan": { icon: Cookie, className: "text-yellow-600" },
};

export function CategoryNav() {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useQuery<ApiSuccess<Category[]>>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Gagal memuat kategori");
      return res.json();
    },
  });

  const categories = data?.data ?? [];

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto px-4 pb-3 scrollbar-hide">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="flex shrink-0 flex-col items-center gap-2 w-[100px] sm:w-[120px]">
            <Skeleton className="size-16 sm:size-20 rounded-xl" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error || categories.length === 0) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => scroll("left")}
          className="hidden shrink-0 sm:flex size-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm hover:bg-gray-50 hover:text-gray-700"
          aria-label="Scroll kiri"
        >
          <ChevronLeft className="size-5" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto py-2 scrollbar-hide"
        >
          {categories.map((category) => {
            const href = `/categories/${category.slug}`;
            const isActive = pathname === href;
            const fallback = categoryIconMap[category.slug];
            const FallbackIcon = fallback?.icon ?? LayoutGrid;

            return (
              <Link
                key={category.id}
                href={href}
                className={cn(
                  "flex w-[100px] sm:w-[120px] shrink-0 flex-col items-center gap-2.5 rounded-2xl border bg-white p-3 sm:p-4 transition-all hover:shadow-md",
                  isActive
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-gray-100 hover:border-gray-200"
                )}
              >
                <div className="relative flex size-16 sm:size-20 items-center justify-center overflow-hidden rounded-xl bg-gray-50">
                  {category.iconUrl ? (
                    <Image
                      src={category.iconUrl}
                      alt={category.name}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <FallbackIcon
                      className={cn(
                        "size-7 sm:size-8",
                        fallback?.className ?? "text-gray-400"
                      )}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    "line-clamp-2 text-center text-xs sm:text-sm font-medium leading-tight",
                    isActive ? "text-primary" : "text-gray-700"
                  )}
                >
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => scroll("right")}
          className="hidden shrink-0 sm:flex size-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm hover:bg-gray-50 hover:text-gray-700"
          aria-label="Scroll kanan"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}
