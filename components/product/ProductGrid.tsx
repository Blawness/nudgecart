import { Package } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ProductGridSkeleton } from "@/components/shared/LoadingSkeleton";
import { ProductCard } from "./ProductCard";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  imageUrl: string;
  storeName: string;
  merchantId: string;
}

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

export function ProductGrid({ products, isLoading }: ProductGridProps) {
  if (isLoading) {
    return <ProductGridSkeleton />;
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Belum ada produk"
        description="Belum ada produk yang tersedia saat ini. Silakan cek kembali nanti."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
