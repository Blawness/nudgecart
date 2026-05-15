"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface PersonalPromoBannerProps {
  userName: string;
  productName: string;
  productSlug?: string;
  onClick: () => void;
}

export function PersonalPromoBanner({
  userName,
  productName,
  productSlug,
  onClick,
}: PersonalPromoBannerProps) {
  return (
    <Link
      href={productSlug ? `/products/${productSlug}` : "#"}
      onClick={onClick}
      className="block"
    >
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/80 text-white px-5 py-4 border border-primary">
        <span className="absolute top-2 left-3 text-[10px] font-medium bg-white/20 text-white rounded-full px-2 py-0.5">
          Khusus untukmu
        </span>
        <div className="mt-3">
          <p className="text-sm font-bold leading-snug">
            Hai {userName}, stok {productName} kamu hampir habis. Dapatkan diskon 10% hari ini!
          </p>
        </div>
        <div className="mt-2 flex items-center gap-1 text-xs font-medium text-white/80">
          <span>Lihat promo</span>
          <ArrowRight className="size-3" />
        </div>
      </div>
    </Link>
  );
}
