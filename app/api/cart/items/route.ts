import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, and, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { carts, cartItems, products } from "@/drizzle/schema";

const addItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const role = (session.user as unknown as Record<string, unknown>).role;
    if (role !== "BUYER") {
      return NextResponse.json({ error: "Hanya pembeli yang dapat menambah ke keranjang" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = addItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    const { productId, quantity } = parsed.data;

    const [product] = await db
      .select({ id: products.id, stock: products.stock, isActive: products.isActive })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    if (!product.isActive) {
      return NextResponse.json({ error: "Produk tidak tersedia" }, { status: 400 });
    }

    if (product.stock < quantity) {
      return NextResponse.json({ error: "Stok tidak mencukupi" }, { status: 400 });
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
        and(
          eq(cartItems.cartId, cart.id),
          eq(cartItems.productId, productId),
          isNull(cartItems.bundleId)
        )
      )
      .limit(1);

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > product.stock) {
        return NextResponse.json({ error: "Stok tidak mencukupi" }, { status: 400 });
      }
      const [updated] = await db
        .update(cartItems)
        .set({ quantity: newQty })
        .where(eq(cartItems.id, existing.id))
        .returning();
      return NextResponse.json({ data: updated }, { status: 200 });
    }

    const [newItem] = await db
      .insert(cartItems)
      .values({
        cartId: cart.id,
        productId,
        quantity,
      })
      .returning();

    return NextResponse.json({ data: newItem }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal menambah ke keranjang" }, { status: 500 });
  }
}
