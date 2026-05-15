"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductTable } from "@/components/merchant/ProductTable";

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Produk Saya</h2>
        <Button render={<Link href="/merchant/products/new" />}>
          Tambah Produk
        </Button>
      </div>
      <ProductTable />
    </div>
  );
}
