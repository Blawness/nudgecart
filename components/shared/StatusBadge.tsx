import type { OrderStatus } from "@/types";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  PENDING_PAYMENT: {
    label: "Menunggu Pembayaran",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  CONFIRMED: {
    label: "Dikonfirmasi",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  PROCESSING: {
    label: "Diproses",
    className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  },
  SHIPPED: {
    label: "Dikirim",
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  },
  DELIVERED: {
    label: "Selesai",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  CANCELLED: {
    label: "Dibatalkan",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
};

interface StatusBadgeProps {
  status: OrderStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
