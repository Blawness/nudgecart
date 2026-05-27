import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { banners } from "@/drizzle/schema";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Promo - NudgeCart",
  description: "Promo dan penawaran spesial dari NudgeCart",
};

export default async function PromoPage() {
  const activeBanners = await db
    .select({
      id: banners.id,
      title: banners.title,
      subtitle: banners.subtitle,
      imageUrl: banners.imageUrl,
      link: banners.link,
      bgColor: banners.bgColor,
      textColor: banners.textColor,
    })
    .from(banners)
    .where(eq(banners.isActive, true))
    .orderBy(banners.order);

  return (
    <div className="px-4 py-6">
      <h1 className="mb-5 text-lg font-bold text-gray-900">Promo</h1>

      {activeBanners.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sm text-muted-foreground">
            Belum ada promo saat ini
          </p>
          <Link
            href="/"
            className="mt-3 text-sm font-medium text-primary hover:underline"
          >
            Kembali ke Beranda
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeBanners.map((banner) => (
            <Link key={banner.id} href={banner.link} className="group">
              <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title}
                    fill
                    unoptimized
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <CardContent
                  className="flex items-center justify-between gap-2 p-4"
                  style={{
                    backgroundColor: banner.bgColor,
                    color: banner.textColor,
                  }}
                >
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold">
                      {banner.title}
                    </h3>
                    {banner.subtitle && (
                      <p className="truncate text-xs opacity-80">
                        {banner.subtitle}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="size-4 shrink-0 opacity-70" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
