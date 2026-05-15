import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { merchants } from "@/drizzle/schema";

const updateStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED"]),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const parsed = updateStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Status harus ACTIVE atau SUSPENDED" },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select({ id: merchants.id })
      .from(merchants)
      .where(eq(merchants.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Merchant tidak ditemukan" },
        { status: 404 }
      );
    }

    const [updated] = await db
      .update(merchants)
      .set({ status: parsed.data.status, updatedAt: new Date() })
      .where(eq(merchants.id, id))
      .returning();

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
