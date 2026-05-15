"use client"

import React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  ChevronDownIcon,
  CheckIcon,
  Loader2Icon,
  ShoppingBagIcon,
} from "lucide-react"
import { formatRupiah } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { TableSkeleton } from "@/components/shared/LoadingSkeleton"
import type { OrderStatus } from "@/types"

const NEXT_STATUS: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  CONFIRMED: { status: "PROCESSING", label: "Proses Pesanan" },
  PROCESSING: { status: "SHIPPED", label: "Kirim Pesanan" },
}

interface Order {
  id: string
  status: OrderStatus
  total: number
  buyer?: { name: string }
  createdAt: string
}

async function fetchOrders(): Promise<Order[]> {
  const res = await fetch("/api/merchant/orders")
  if (!res.ok) throw new Error("Gagal memuat pesanan")
  const json = await res.json()
  return json.data ?? json
}

async function updateOrderStatus({
  orderId,
  status,
}: {
  orderId: string
  status: OrderStatus
}): Promise<void> {
  const res = await fetch(`/api/merchant/orders/${orderId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error("Gagal memperbarui status pesanan")
}

export function OrderTable() {
  const queryClient = useQueryClient()

  const { data: orders, isLoading } = useQuery({
    queryKey: ["merchant-orders"],
    queryFn: fetchOrders,
  })

  const statusMutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      toast.success("Status pesanan diperbarui")
      queryClient.invalidateQueries({ queryKey: ["merchant-orders"] })
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Gagal memperbarui status"
      )
    },
  })

  if (isLoading) return <TableSkeleton rows={5} />

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <ShoppingBagIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Belum ada pesanan</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Pesanan dari pembeli akan muncul di sini
        </p>
      </div>
    )
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID Order</TableHead>
          <TableHead>Pembeli</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Tanggal</TableHead>
          <TableHead className="w-40">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const nextAction = NEXT_STATUS[order.status]
          return (
            <TableRow key={order.id}>
              <TableCell className="font-mono text-xs">
                {order.id.substring(0, 8).toUpperCase()}
              </TableCell>
              <TableCell>{order.buyer?.name ?? "-"}</TableCell>
              <TableCell>{formatRupiah(order.total)}</TableCell>
              <TableCell>
                <StatusBadge status={order.status} />
              </TableCell>
              <TableCell>{formatDate(order.createdAt)}</TableCell>
              <TableCell>
                {nextAction ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="outline" size="sm" />}
                    >
                      Proses
                      <ChevronDownIcon className="ml-1 size-3" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        disabled={statusMutation.isPending}
                        onClick={() =>
                          statusMutation.mutate({
                            orderId: order.id,
                            status: nextAction.status,
                          })
                        }
                      >
                        {statusMutation.isPending ? (
                          <Loader2Icon className="mr-1 size-3 animate-spin" />
                        ) : (
                          <CheckIcon className="mr-1 size-3" />
                        )}
                        {nextAction.label}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
