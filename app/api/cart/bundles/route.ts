import { NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";

import { carts, cartItems, products } from "@/drizzle/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  getBundleNormalTotal,
  promoBundles,
} from "@/lib/promo-bundles";

const addBundleSchema = z.object({
  bundleId: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu" },
        { status: 401 },
      );
    }

    const role = (session.user as unknown as Record<string, unknown>).role;
    if (role !== "BUYER") {
      return NextResponse.json(
        { error: "Hanya pembeli yang dapat menambah ke keranjang" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = addBundleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    const { bundleId, quantity } = parsed.data;
    const bundle = promoBundles.find((item) => item.id === bundleId);
    const firstItem = bundle?.items[0];
    if (!bundle || !firstItem) {
      return NextResponse.json(
        { error: "Paket promo tidak ditemukan" },
        { status: 404 },
      );
    }

    const [product] = await db
      .select({
        id: products.id,
        stock: products.stock,
        isActive: products.isActive,
      })
      .from(products)
      .where(eq(products.slug, firstItem.productSlug))
      .limit(1);

    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: "Produk utama paket tidak tersedia" },
        { status: 400 },
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: "Stok paket tidak mencukupi" },
        { status: 400 },
      );
    }

    let [cart] = await db
      .select({ id: carts.id })
      .from(carts)
      .where(eq(carts.userId, session.user.id))
      .limit(1);

    if (!cart) {
      [cart] = await db
        .insert(carts)
        .values({ userId: session.user.id })
        .returning({ id: carts.id });
    }

    const [existing] = await db
      .select({ id: cartItems.id, quantity: cartItems.quantity })
      .from(cartItems)
      .where(
        and(eq(cartItems.cartId, cart.id), eq(cartItems.bundleId, bundle.id)),
      )
      .limit(1);

    if (existing) {
      const newQuantity = existing.quantity + quantity;
      if (newQuantity > product.stock) {
        return NextResponse.json(
          { error: "Stok paket tidak mencukupi" },
          { status: 400 },
        );
      }

      const [updated] = await db
        .update(cartItems)
        .set({ quantity: newQuantity })
        .where(eq(cartItems.id, existing.id))
        .returning();

      return NextResponse.json({ data: updated });
    }

    const [newItem] = await db
      .insert(cartItems)
      .values({
        cartId: cart.id,
        productId: product.id,
        quantity,
        bundleId: bundle.id,
        bundleName: bundle.name,
        bundleType: bundle.type,
        bundlePrice: bundle.bundlePrice,
        bundleNormalTotal: getBundleNormalTotal(bundle),
        bundleItems: bundle.items.map((item) =>
          `${item.name} x${item.quantity ?? 1}`,
        ),
      })
      .returning();

    return NextResponse.json({ data: newItem }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Gagal menambah paket ke keranjang" },
      { status: 500 },
    );
  }
}
