import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { merchants, users } from "@/drizzle/schema";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [merchant] = await db
      .select({
        id: merchants.id,
        storeName: merchants.storeName,
        description: merchants.description,
        logoUrl: merchants.logoUrl,
        status: merchants.status,
        createdAt: merchants.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(merchants)
      .innerJoin(users, eq(merchants.userId, users.id))
      .where(eq(merchants.id, id))
      .limit(1);

    if (!merchant) {
      return NextResponse.json(
        { error: "Toko tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: merchant });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
