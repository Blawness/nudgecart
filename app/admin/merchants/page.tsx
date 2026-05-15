"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Store } from "lucide-react";
import { MerchantTable } from "@/components/admin/MerchantTable";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";

async function fetchMerchants() {
  const res = await fetch("/api/admin/merchants");
  if (!res.ok) throw new Error("Gagal memuat data merchant");
  const json = await res.json();
  return json.data ?? json;
}

export default function AdminMerchantsPage() {
  const { data: merchants, isLoading } = useQuery({
    queryKey: ["admin-merchants"],
    queryFn: fetchMerchants,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Merchant</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Kelola pendaftaran dan status merchant
      </p>
      <div className="mt-6">
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : !merchants || merchants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Store className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Belum ada merchant</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Data merchant akan muncul setelah ada yang mendaftar
            </p>
          </div>
        ) : (
          <MerchantTable />
        )}
      </div>
    </div>
  );
}
