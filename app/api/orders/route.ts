import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, inArray, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  carts,
  cartItems,
  products,
  merchants,
  orders,
  orderItems,
  productImages,
} from "@/drizzle/schema";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const orderList = await db
      .select({
        id: orders.id,
        status: orders.status,
        subtotal: orders.subtotal,
        shippingFee: orders.shippingFee,
        total: orders.total,
        paymentMethod: orders.paymentMethod,
        createdAt: orders.createdAt,
        merchantName: merchants.storeName,
      })
      .from(orders)
      .innerJoin(merchants, eq(orders.merchantId, merchants.id))
      .where(eq(orders.userId, session.user.id))
      .orderBy(orders.createdAt);

    if (orderList.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const orderIds = orderList.map((o) => o.id);

    const items = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productName: orderItems.productName,
        productPrice: orderItems.productPrice,
        quantity: orderItems.quantity,
        subtotal: orderItems.subtotal,
      })
      .from(orderItems)
      .where(inArray(orderItems.orderId, orderIds));

    const itemsByOrder = new Map<string, typeof items>();
    for (const item of items) {
      const arr = itemsByOrder.get(item.orderId) ?? [];
      arr.push(item);
      itemsByOrder.set(item.orderId, arr);
    }

    const result = orderList.map((order) => ({
      id: order.id,
      status: order.status,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      total: order.total,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      merchantName: order.merchantName,
      orderItems: itemsByOrder.get(order.id) ?? [],
    }));

    return NextResponse.json({ data: result });
  } catch {
    return NextResponse.json({ error: "Gagal memuat pesanan" }, { status: 500 });
  }
}

const checkoutSchema = z.object({
  addressId: z.string().uuid(),
  paymentMethod: z.enum(["BANK_TRANSFER", "COD"]),
  note: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    const { addressId, paymentMethod, note } = parsed.data;

    const [cart] = await db
      .select({ id: carts.id })
      .from(carts)
      .where(eq(carts.userId, session.user.id))
      .limit(1);

    if (!cart) {
      return NextResponse.json({ error: "Keranjang kosong" }, { status: 400 });
    }

    const items = await db
      .select({
        cartItemId: cartItems.id,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        productName: products.name,
        price: products.price,
        stock: products.stock,
        isActive: products.isActive,
        merchantId: merchants.id,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .innerJoin(merchants, eq(products.merchantId, merchants.id))
      .where(eq(cartItems.cartId, cart.id));

    if (items.length === 0) {
      return NextResponse.json({ error: "Keranjang kosong" }, { status: 400 });
    }

    for (const item of items) {
      if (!item.isActive) {
        return NextResponse.json(
          { error: `Produk "${item.productName}" tidak tersedia` },
          { status: 400 }
        );
      }
      if (item.quantity > item.stock) {
        return NextResponse.json(
          { error: `Stok "${item.productName}" tidak mencukupi` },
          { status: 400 }
        );
      }
    }

    const byMerchant = new Map<
      string,
      { merchantId: string; items: typeof items }
    >();
    for (const item of items) {
      const group = byMerchant.get(item.merchantId);
      if (group) {
        group.items.push(item);
      } else {
        byMerchant.set(item.merchantId, {
          merchantId: item.merchantId,
          items: [item],
        });
      }
    }

    const createdOrders = await db.transaction(async (tx) => {
      const result: Array<{ id: string }> = [];

      for (const [, group] of byMerchant) {
        const subtotal = group.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        const shippingFee = 10000;
        const total = subtotal + shippingFee;

        const [order] = await tx
          .insert(orders)
          .values({
            userId: session.user!.id!,
            merchantId: group.merchantId,
            addressId,
            status: "PENDING_PAYMENT",
            subtotal,
            shippingFee,
            total,
            paymentMethod,
            note: note ?? null,
          })
          .returning({ id: orders.id });

        for (const item of group.items) {
          const itemSubtotal = item.price * item.quantity;

          await tx.insert(orderItems).values({
            orderId: order.id,
            productId: item.productId,
            productName: item.productName,
            productPrice: item.price,
            quantity: item.quantity,
            subtotal: itemSubtotal,
          });

          await tx
            .update(products)
            .set({ stock: item.stock - item.quantity })
            .where(eq(products.id, item.productId));
        }

        result.push(order);
      }

      await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id));

      return result;
    });

    return NextResponse.json({ data: createdOrders }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal membuat pesanan" }, { status: 500 });
  }
}
