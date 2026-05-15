"use client";

import { Building, Banknote } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types";

interface PaymentMethodPickerProps {
  value: PaymentMethod | null;
  onChange: (method: PaymentMethod) => void;
}

const paymentOptions: {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: typeof Building;
}[] = [
  {
    id: "BANK_TRANSFER",
    label: "Transfer Bank",
    description: "Lakukan pembayaran melalui transfer bank",
    icon: Building,
  },
  {
    id: "COD",
    label: "Bayar di Tempat (COD)",
    description: "Bayar saat pesanan diterima",
    icon: Banknote,
  },
];

export function PaymentMethodPicker({
  value,
  onChange,
}: PaymentMethodPickerProps) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-heading text-base font-medium">
        Metode Pembayaran
      </h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {paymentOptions.map((option) => {
          const isSelected = value === option.id;
          const Icon = option.icon;
          return (
            <Card
              key={option.id}
              className={cn(
                "cursor-pointer transition-colors hover:bg-muted/50",
                isSelected && "ring-2 ring-primary bg-primary/5"
              )}
              onClick={() => onChange(option.id)}
            >
              <CardContent className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
                    isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{option.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
