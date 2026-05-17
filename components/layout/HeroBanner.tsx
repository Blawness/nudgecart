"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRight, Pencil } from "lucide-react";
import { useSession } from "next-auth/react";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  link: string;
  bgColor: string;
  textColor: string;
}

export function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [startX, setStartX] = useState<number | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const { data: session } = useSession();
  const isAdmin = (session?.user as unknown as Record<string, unknown>)?.role === "ADMIN";

  useEffect(() => {
    fetch("/api/banners")
      .then((res) => res.json())
      .then((json) => {
        if (json.data && json.data.length > 0) {
          setBanners(json.data);
        }
      })
      .catch(() => {
        // fallback: empty banners
      });
  }, []);

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % Math.max(banners.length, 1)),
    [banners.length]
  );

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next, banners.length]);

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
  const goNext = () =>
    setCurrent((c) => (c + 1) % banners.length);

  if (banners.length === 0) {
    return null;
  }

  return (
    <section className="bg-white pt-6 pb-2">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-3 flex items-center justify-between">
          <div />
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                href="/admin/banners"
                className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-primary"
              >
                <Pencil className="size-3" />
                Edit Banner
              </Link>
            )}
            <Link
              href="/promo"
              className="flex items-center gap-0.5 text-sm font-medium text-primary hover:underline"
            >
              Lihat Semua
              <ChevronRight className="size-4" />
            </Link>
          </div>
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
                <Link href={banner.link}>
                  <div
                    className="relative flex aspect-[4.5/1] w-full items-center overflow-hidden rounded-xl"
                    style={{ backgroundColor: banner.bgColor }}
                  >
                    <Image
                      src={banner.imageUrl}
                      alt={banner.title}
                      width={1200}
                      height={260}
                      unoptimized
                      className="absolute inset-0 h-full w-full object-cover opacity-90"
                      priority
                    />
                    <div className="relative z-10 flex flex-col justify-center px-8 sm:px-12">
                      <h2
                        className="text-xl font-bold sm:text-3xl lg:text-4xl"
                        style={{ color: banner.textColor }}
                      >
                        {banner.title}
                      </h2>
                      {banner.subtitle && (
                        <p
                          className="mt-1 text-sm sm:text-base lg:text-lg"
                          style={{ color: banner.textColor, opacity: 0.9 }}
                        >
                          {banner.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
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
