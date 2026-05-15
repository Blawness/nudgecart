"use client";

import Image from "next/image";

export function AppDownloadBanner() {
  return (
    <section className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-left">
            <h2 className="text-xl font-extrabold text-white md:text-2xl">
              Download Pasarku Sekarang!
            </h2>
            <p className="mt-1 text-sm text-white/80">
              Lebih banyak pilihan produk & promo
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-lg"
            >
              <Image
                src="https://placehold.co/140x42/000000/FFFFFF?text=Google+Play"
                alt="Download di Google Play"
                width={140}
                height={42}
                unoptimized
                className="h-[42px] w-[140px] object-contain"
              />
            </a>
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-lg"
            >
              <Image
                src="https://placehold.co/140x42/000000/FFFFFF?text=App+Store"
                alt="Download di App Store"
                width={140}
                height={42}
                unoptimized
                className="h-[42px] w-[140px] object-contain"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
