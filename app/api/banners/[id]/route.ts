import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { banners } from "@/drizzle/schema";
import { auth } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userRole = (session?.user as unknown as Record<string, unknown>)?.role as string | undefined;
    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, subtitle, imageUrl, link, bgColor, textColor, order, isActive } = body;

    const [banner] = await db
      .update(banners)
      .set({
        title,
        subtitle,
        imageUrl,
        link,
        bgColor,
        textColor,
        order,
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(banners.id, id))
      .returning();

    if (!banner) {
      return NextResponse.json({ error: "Banner tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ data: banner });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userRole = (session?.user as unknown as Record<string, unknown>)?.role as string | undefined;
    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [banner] = await db
      .delete(banners)
      .where(eq(banners.id, id))
      .returning();

    if (!banner) {
      return NextResponse.json({ error: "Banner tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ data: banner });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
