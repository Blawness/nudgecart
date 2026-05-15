import Image from "next/image";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import { AddToCartButton } from "./AddToCartButton";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    imageUrl: string;
    storeName: string;
    merchantId: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const outOfStock = product.stock === 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            unoptimized
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
          />
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-800 shadow">
                Stok Habis
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col p-3">
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-gray-800 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-1.5">
          <Badge variant="secondary" className="bg-orange-50 text-orange-700 text-[10px] font-medium hover:bg-orange-50">
            Pengiriman Instan
          </Badge>
        </div>

        <div className="mt-auto pt-2">
          <p className="text-sm font-bold text-primary leading-tight">
            {formatRupiah(product.price)}
          </p>
        </div>

        {!outOfStock && (
          <div className="mt-2">
            <AddToCartButton
              productId={product.id}
              stock={product.stock}
              label="Beli"
              className="w-full rounded-lg bg-primary text-white hover:bg-primary/90"
            />
          </div>
        )}
      </div>
    </div>
  );
}
