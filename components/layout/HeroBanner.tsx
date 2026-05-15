"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

const banners = [
  {
    id: 1,
    image: "https://placehold.co/1200x260/dc2626/ffffff?text=CASHBACK+Rp+10.000",
    alt: "Promo Cashback Rp 10.000",
  },
  {
    id: 2,
    image: "https://placehold.co/1200x260/ea580c/ffffff?text=PROMO+JSM",
    alt: "Promo JSM",
  },
  {
    id: 3,
    image: "https://placehold.co/1200x260/dc2626/ffffff?text=GRATIS+ONGKIR",
    alt: "Gratis Ongkir",
  },
  {
    id: 4,
    image: "https://placehold.co/1200x260/ea580c/ffffff?text=DISKON+40%25",
    alt: "Diskon 40%",
  },
  {
    id: 5,
    image: "https://placehold.co/1200x260/dc2626/ffffff?text=PROMO+HEMAT",
    alt: "Promo Hemat",
  },
];

export function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [startX, setStartX] = useState<number | null>(null);

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % banners.length),
    []
  );

  useEffect(() => {
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next]);

  const handlePointerDown = (e: React.PointerEvent) => setStartX(e.clientX);
  const handlePointerUp = (e: React.PointerEvent) => {
    if (startX === null) return;
    const delta = e.clientX - startX;
    if (Math.abs(delta) > 40) {
      setCurrent((c) =>
        delta < 0
          ? (c + 1) % banners.length
          : (c - 1 + banners.length) % banners.length
      );
    }
    setStartX(null);
  };

  const goTo = (index: number) => setCurrent(index);
  const goPrev = () =>
    setCurrent((c) => (c - 1 + banners.length) % banners.length);
  const goNext = () => setCurrent((c) => (c + 1) % banners.length);

  return (
    <section className="bg-white pt-6 pb-2">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-3 flex items-center justify-between">
          <div />
          <Link
            href="/promo"
            className="flex items-center gap-0.5 text-sm font-medium text-primary hover:underline"
          >
            Lihat Semua
            <ChevronRight className="size-4" />
          </Link>
        </div>

        <div
          className="relative overflow-hidden rounded-xl select-none"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          {/* Slides */}
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="relative w-full shrink-0"
                style={{ minWidth: "100%" }}
              >
                <Image
                  src={banner.image}
                  alt={banner.alt}
                  width={1200}
                  height={260}
                  unoptimized
                  className="aspect-[4.5/1] w-full rounded-xl object-cover"
                  priority={banner.id === 1}
                />
              </div>
            ))}
          </div>

          {/* Previous / Next */}
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md hover:bg-white"
            aria-label="Banner sebelumnya"
          >
            <ChevronRight className="size-4 rotate-180" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md hover:bg-white"
            aria-label="Banner berikutnya"
          >
            <ChevronRight className="size-4" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i === current
                    ? "w-5 bg-primary"
                    : "w-2 bg-white/60 hover:bg-white"
                )}
                aria-label={`Banner ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
