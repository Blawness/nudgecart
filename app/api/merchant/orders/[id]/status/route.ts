import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { requireRole } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { merchants, orders } from "@/drizzle/schema";
import type { OrderStatus } from "@/types";

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

const statusUpdateSchema = z.object({
  status: z.string().min(1, "Status wajib diisi"),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: authUser, error } = await requireRole("MERCHANT");
    if (error) return error;
    const userId = authUser.id;

    const [merchant] = await db
      .select()
      .from(merchants)
      .where(eq(merchants.userId, userId))
      .limit(1);

    if (!merchant) {
      return NextResponse.json(
        { error: "Merchant tidak ditemukan" },
        { status: 404 }
      );
    }

    const { id } = await params;

    const [order] = await db
      .select()
      .from(orders)
      .where(
        and(eq(orders.id, id), eq(orders.merchantId, merchant.id))
      )
      .limit(1);

    if (!order) {
      return NextResponse.json(
        { error: "Pesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = statusUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Status tidak valid" },
        { status: 400 }
      );
    }

    const { status } = parsed.data;

    const allowedStatuses = VALID_TRANSITIONS[order.status as OrderStatus];
    if (!allowedStatuses || !allowedStatuses.includes(status as OrderStatus)) {
      return NextResponse.json(
        {
          error: `Status tidak dapat diubah dari ${order.status} ke ${status}`,
        },
        { status: 400 }
      );
    }

    const [updatedOrder] = await db
      .update(orders)
      .set({ status: status as OrderStatus, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();

    return NextResponse.json({ data: updatedOrder });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
