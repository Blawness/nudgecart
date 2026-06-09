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
  merchantId?: string;
}

interface CartSummaryProps {
  items: SummaryItem[];
  shippingFee: number;
  promoActive?: boolean;
}

const FREE_SHIPPING_MINIMUM = 50000;

export function CartSummary({
  items,
  shippingFee,
  promoActive = true,
}: CartSummaryProps) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const merchantSubtotals = new Map<string, number>();
  for (const item of items) {
    const merchantKey = item.merchantId ?? "default";
    merchantSubtotals.set(
      merchantKey,
      (merchantSubtotals.get(merchantKey) ?? 0) + item.price * item.quantity,
    );
  }
  const merchantTotals = Array.from(merchantSubtotals.values());
  const promoDiscount = promoActive
    ? merchantTotals.reduce(
        (sum, merchantSubtotal) =>
          sum + (merchantSubtotal >= FREE_SHIPPING_MINIMUM ? shippingFee : 0),
        0,
      )
    : 0;
  const baseShippingFee = shippingFee * Math.max(merchantTotals.length, 1);
  const finalShippingFee = baseShippingFee - promoDiscount;
  const total = subtotal + finalShippingFee;
  const isEmpty = items.length === 0;
  const checkoutHref = promoActive
    ? "/checkout?promo=gratis-ongkir"
    : "/checkout?promo=none";

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
                Flat Rp 10.000 per toko
              </span>
            </div>
            <span>{formatRupiah(baseShippingFee)}</span>
          </div>
          {promoDiscount > 0 && (
            <div className="flex items-center justify-between text-green-700">
              <span>Diskon Promo</span>
              <span>-{formatRupiah(promoDiscount)}</span>
            </div>
          )}
          {promoActive && subtotal < FREE_SHIPPING_MINIMUM && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Promo gratis ongkir aktif untuk tiap toko dengan belanja minimal{" "}
              {formatRupiah(FREE_SHIPPING_MINIMUM)}.
            </p>
          )}
          <div className="flex items-center justify-between border-t pt-2 font-medium">
            <span>Total</span>
            <span className="text-base" data-testid="cart-summary-total">
              {formatRupiah(total)}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          disabled={isEmpty}
          render={<Link href={checkoutHref} />}
        >
          Checkout
        </Button>
      </CardFooter>
    </Card>
  );
}
