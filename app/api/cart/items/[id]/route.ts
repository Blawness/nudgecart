import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { carts, cartItems, products } from "@/drizzle/schema";

const updateSchema = z.object({
  quantity: z.number().int().min(1),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    const { quantity } = parsed.data;

    const [item] = await db
      .select({
        id: cartItems.id,
        cartId: cartItems.cartId,
        quantity: cartItems.quantity,
        stock: products.stock,
        cartUserId: carts.userId,
        isActive: products.isActive,
      })
      .from(cartItems)
      .innerJoin(carts, eq(cartItems.cartId, carts.id))
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.id, id))
      .limit(1);

    if (!item) {
      return NextResponse.json({ error: "Item tidak ditemukan" }, { status: 404 });
    }

    if (item.cartUserId !== session.user.id) {
      return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
    }

    if (!item.isActive) {
      return NextResponse.json({ error: "Produk tidak tersedia" }, { status: 400 });
    }

    if (quantity > item.stock) {
      return NextResponse.json({ error: "Stok tidak mencukupi" }, { status: 400 });
    }

    const [updated] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: "Gagal mengubah item" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const { id } = await params;

    const [item] = await db
      .select({
        id: cartItems.id,
        cartUserId: carts.userId,
      })
      .from(cartItems)
      .innerJoin(carts, eq(cartItems.cartId, carts.id))
      .where(eq(cartItems.id, id))
      .limit(1);

    if (!item) {
      return NextResponse.json({ error: "Item tidak ditemukan" }, { status: 404 });
    }

    if (item.cartUserId !== session.user.id) {
      return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
    }

    await db.delete(cartItems).where(eq(cartItems.id, id));

    return NextResponse.json({ data: { success: true } });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus item" }, { status: 500 });
  }
}
