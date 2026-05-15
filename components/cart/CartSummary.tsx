import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatRupiah } from "@/lib/utils";

interface SummaryItem {
  price: number;
  quantity: number;
}

interface CartSummaryProps {
  items: SummaryItem[];
  shippingFee: number;
}

export function CartSummary({ items, shippingFee }: CartSummaryProps) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = subtotal + shippingFee;
  const isEmpty = items.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ringkasan Belanja</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatRupiah(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-muted-foreground">Ongkos Kirim</span>
              <span className="text-xs text-muted-foreground">
                Flat Rp 10.000
              </span>
            </div>
            <span>{formatRupiah(shippingFee)}</span>
          </div>
          <div className="flex items-center justify-between border-t pt-2 font-medium">
            <span>Total</span>
            <span className="text-base">{formatRupiah(total)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          disabled={isEmpty}
          render={<Link href="/checkout" />}
        >
          Checkout
        </Button>
      </CardFooter>
    </Card>
  );
}
