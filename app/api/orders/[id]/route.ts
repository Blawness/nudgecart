import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders, orderItems, merchants, addresses, products } from "@/drizzle/schema";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const { id } = await params;

    const [order] = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        merchantId: orders.merchantId,
        addressId: orders.addressId,
        status: orders.status,
        subtotal: orders.subtotal,
        shippingFee: orders.shippingFee,
        total: orders.total,
        paymentMethod: orders.paymentMethod,
        note: orders.note,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        merchantName: merchants.storeName,
      })
      .from(orders)
      .innerJoin(merchants, eq(orders.merchantId, merchants.id))
      .where(eq(orders.id, id))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    const role = (session.user as Record<string, unknown>).role;

    if (
      order.userId !== session.user.id &&
      role !== "ADMIN" &&
      !(
        role === "MERCHANT" &&
        (await checkMerchantOwnership(session.user.id, order.merchantId))
      )
    ) {
      return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
    }

    const items = await db
      .select({
        id: orderItems.id,
        productId: orderItems.productId,
        productName: orderItems.productName,
        productPrice: orderItems.productPrice,
        quantity: orderItems.quantity,
        subtotal: orderItems.subtotal,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id))
      .orderBy(orderItems.id);

    const [address] = await db
      .select({
        id: addresses.id,
        label: addresses.label,
        recipientName: addresses.recipientName,
        phone: addresses.phone,
        street: addresses.street,
        city: addresses.city,
        province: addresses.province,
        postalCode: addresses.postalCode,
      })
      .from(addresses)
      .where(eq(addresses.id, order.addressId))
      .limit(1);

    return NextResponse.json({
      data: {
        id: order.id,
        userId: order.userId,
        merchantName: order.merchantName,
        status: order.status,
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        total: order.total,
        paymentMethod: order.paymentMethod,
        note: order.note,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items,
        address,
      },
    });
  } catch {
    return NextResponse.json({ error: "Gagal memuat pesanan" }, { status: 500 });
  }
}

async function checkMerchantOwnership(
  userId: string,
  merchantId: string
): Promise<boolean> {
  const [merchant] = await db
    .select({ id: merchants.id })
    .from(merchants)
    .where(eq(merchants.id, merchantId))
    .limit(1);

  if (!merchant) return false;

  const [userMerchant] = await db
    .select({ id: merchants.id })
    .from(merchants)
    .where(eq(merchants.userId, userId))
    .limit(1);

  return userMerchant?.id === merchantId;
}
