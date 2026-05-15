"use client"

import React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { StoreIcon, CheckIcon, BanIcon, PlayIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableSkeleton } from "@/components/shared/LoadingSkeleton"
import type { MerchantStatus } from "@/types"

const STATUS_BADGE_CONFIG: Record<MerchantStatus, { label: string; className: string }> = {
  PENDING: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  ACTIVE: {
    label: "Aktif",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  SUSPENDED: {
    label: "Ditangguhkan",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
}

interface Merchant {
  id: string
  shopName: string
  owner: { email: string }
  status: MerchantStatus
  createdAt: string
}

async function fetchMerchants(): Promise<Merchant[]> {
  const res = await fetch("/api/admin/merchants")
  if (!res.ok) throw new Error("Gagal memuat data merchant")
  const json = await res.json()
  return json.data ?? json
}

async function updateMerchantStatus({
  id,
  status,
}: {
  id: string
  status: MerchantStatus
}): Promise<void> {
  const res = await fetch(`/api/admin/merchants/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error("Gagal memperbarui status merchant")
}

export function MerchantTable() {
  const queryClient = useQueryClient()

  const { data: merchants, isLoading } = useQuery({
    queryKey: ["admin-merchants"],
    queryFn: fetchMerchants,
  })

  const statusMutation = useMutation({
    mutationFn: updateMerchantStatus,
    onSuccess: () => {
      toast.success("Status merchant diperbarui")
      queryClient.invalidateQueries({ queryKey: ["admin-merchants"] })
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Gagal memperbarui status"
      )
    },
  })

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })

  if (isLoading) return <TableSkeleton rows={5} />

  if (!merchants || merchants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <StoreIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Belum ada merchant</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Data merchant akan muncul setelah ada yang mendaftar
        </p>
      </div>
    )
  }

  const getActionButton = (merchant: Merchant) => {
    switch (merchant.status) {
      case "PENDING":
        return (
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-green-600 hover:text-green-700"
            title="Setujui"
            disabled={statusMutation.isPending}
            onClick={() =>
              statusMutation.mutate({ id: merchant.id, status: "ACTIVE" })
            }
          >
            <CheckIcon />
          </Button>
        )
      case "ACTIVE":
        return (
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-red-600 hover:text-red-700"
            title="Tangguhkan"
            disabled={statusMutation.isPending}
            onClick={() =>
              statusMutation.mutate({ id: merchant.id, status: "SUSPENDED" })
            }
          >
            <BanIcon />
          </Button>
        )
      case "SUSPENDED":
        return (
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-green-600 hover:text-green-700"
            title="Aktifkan"
            disabled={statusMutation.isPending}
            onClick={() =>
              statusMutation.mutate({ id: merchant.id, status: "ACTIVE" })
            }
          >
            <PlayIcon />
          </Button>
        )
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama Toko</TableHead>
          <TableHead>Pemilik</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Tanggal Daftar</TableHead>
          <TableHead className="w-16">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {merchants.map((merchant) => (
          <TableRow key={merchant.id}>
            <TableCell className="font-medium">{merchant.shopName}</TableCell>
            <TableCell>{merchant.owner.email}</TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={STATUS_BADGE_CONFIG[merchant.status].className}
              >
                {STATUS_BADGE_CONFIG[merchant.status].label}
              </Badge>
            </TableCell>
            <TableCell>{formatDate(merchant.createdAt)}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                {getActionButton(merchant)}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
