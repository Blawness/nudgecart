import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { merchants, users } from "@/drizzle/schema";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as unknown as Record<string, unknown>)?.role as string | undefined;
    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");

    const result = await db
      .select({
        id: merchants.id,
        storeName: merchants.storeName,
        description: merchants.description,
        logoUrl: merchants.logoUrl,
        status: merchants.status,
        createdAt: merchants.createdAt,
        owner: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(merchants)
      .innerJoin(users, eq(merchants.userId, users.id))
      .where(
        statusFilter
          ? eq(
              merchants.status,
              statusFilter as "PENDING" | "ACTIVE" | "SUSPENDED"
            )
          : undefined
      )
      .orderBy(merchants.createdAt);

    return NextResponse.json({ data: result });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
