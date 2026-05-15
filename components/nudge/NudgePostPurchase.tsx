"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils";

interface EcoProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  imageUrl: string;
  storeName: string;
  merchantId: string;
}

interface NudgePostPurchaseProps {
  headline: string;
  body: string;
  ctaText: string;
  ecoCount: number;
  recommendations: EcoProduct[];
  showConfetti: boolean;
}

export function NudgePostPurchase({
  headline,
  body,
  ctaText,
  ecoCount,
  recommendations,
  showConfetti,
}: NudgePostPurchaseProps) {
  useEffect(() => {
    if (!showConfetti) return;
  }, [showConfetti]);

  return (
    <div className="my-6">
      {showConfetti && (
        <motion.div
          className="text-center mb-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-4xl">🎉🌿</span>
        </motion.div>
      )}

      <motion.div
        className="bg-green-50 rounded-xl border border-green-200 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="font-semibold text-base text-green-800">{headline}</h3>
        <p className="text-sm text-green-700 mt-1">{body}</p>

        {ecoCount > 0 && (
          <div className="mt-3 inline-flex items-center gap-2 bg-green-100 rounded-full px-4 py-1.5">
            <span className="text-xs font-medium text-green-700">
              Ini pembelian ramah lingkungan ke-{ecoCount} kamu bulan ini!
            </span>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Rekomendasi produk eco untukmu:
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {recommendations.slice(0, 3).map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="shrink-0 w-32 bg-white rounded-lg border p-2 hover:shadow-sm transition-shadow"
                >
                  <div className="relative aspect-square overflow-hidden rounded-md bg-muted mb-2">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="120px"
                    />
                  </div>
                  <p className="text-xs font-medium line-clamp-2">{product.name}</p>
                  <p className="text-xs font-bold text-primary mt-1">{formatRupiah(product.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {ctaText && (
          <Button className="mt-4 w-full" variant="outline" render={<Link href="/" />}>
            {ctaText}
          </Button>
        )}
      </motion.div>
    </div>
  );
}
