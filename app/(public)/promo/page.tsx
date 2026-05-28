import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { eq, and, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { banners, products, productImages } from "@/drizzle/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Promo - NudgeCart",
  description: "Promo dan penawaran spesial dari NudgeCart",
};

const ECO_LABEL_BADGE: Record<
  "FRESH" | "ECONOMICAL" | "POPULAR",
  { label: string; className: string }
> = {
  FRESH: {
    label: "Produk Segar",
    className: "bg-green-100 text-green-700 hover:bg-green-100",
  },
  ECONOMICAL: {
    label: "Harga Hemat",
    className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  },
  POPULAR: {
    label: "Best Deal",
    className: "bg-orange-100 text-orange-700 hover:bg-orange-100",
  },
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

  const featuredProducts = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      stock: products.stock,
      ecoLabel: products.ecoLabel,
      imageUrl: productImages.url,
    })
    .from(products)
    .leftJoin(
      productImages,
      and(
        eq(products.id, productImages.productId),
        eq(productImages.order, 0),
      ),
    )
    .where(and(eq(products.isActive, true), isNotNull(products.ecoLabel)))
    .limit(12);

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
            <Link key={banner.id} href={banner.link ?? "/"} className="group">
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
                    backgroundColor: banner.bgColor ?? undefined,
                    color: banner.textColor ?? undefined,
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

      {featuredProducts.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            Produk Promo
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((product) => {
              const badge =
                product.ecoLabel &&
                ECO_LABEL_BADGE[
                  product.ecoLabel as keyof typeof ECO_LABEL_BADGE
                ];
              return (
                <Card
                  key={product.id}
                  className="overflow-hidden transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-square w-full bg-gray-100">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                    {badge && (
                      <Badge
                        className={`absolute left-2 top-2 text-[10px] font-semibold ${badge.className}`}
                      >
                        {badge.label}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <p className="mb-1 line-clamp-2 text-xs font-medium leading-snug text-gray-800">
                      {product.name}
                    </p>
                    <p className="mb-3 text-sm font-bold text-primary">
                      {formatRupiah(product.price)}
                    </p>
                    <Link
                      href={`/products/${product.slug}`}
                      className="block rounded-md border border-primary px-3 py-1.5 text-center text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      + Keranjang
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
