"use client"

import { useQuery } from "@tanstack/react-query"
import {
  PackageIcon,
  ClipboardListIcon,
  BanknoteIcon,
  AlertTriangleIcon,
} from "lucide-react"
import { formatRupiah } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export interface MerchantStatsData {
  totalProducts: number
  activeOrders: number
  revenue: number
  outOfStock: number
}

async function fetchStats(): Promise<MerchantStatsData> {
  const res = await fetch("/api/merchant/stats")
  if (!res.ok) throw new Error("Gagal memuat statistik")
  const json = await res.json()
  return json.data ?? json
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string
  value: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card size="sm">
      <CardContent>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-lg font-semibold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatCardSkeleton() {
  return (
    <Card size="sm">
      <CardContent>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface MerchantStatsProps {
  initialData?: MerchantStatsData
}

export function MerchantStats({ initialData }: MerchantStatsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["merchant-stats"],
    queryFn: fetchStats,
    initialData,
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    )
  }

  const stats = data ?? { totalProducts: 0, activeOrders: 0, revenue: 0, outOfStock: 0 }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        title="Total Produk"
        value={String(stats.totalProducts)}
        icon={PackageIcon}
      />
      <StatCard
        title="Pesanan Aktif"
        value={String(stats.activeOrders)}
        icon={ClipboardListIcon}
      />
      <StatCard
        title="Pendapatan"
        value={formatRupiah(stats.revenue)}
        icon={BanknoteIcon}
      />
      <StatCard
        title="Produk Habis"
        value={String(stats.outOfStock)}
        icon={AlertTriangleIcon}
      />
    </div>
  )
}
