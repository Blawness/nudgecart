import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { banners } from "@/drizzle/schema";
import { requireRole } from "@/lib/auth-utils";

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(banners)
      .where(eq(banners.isActive, true))
      .orderBy(banners.order);

    return NextResponse.json({ data: rows });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireRole("ADMIN");
    if (error) return error;

    const body = await request.json();
    const { title, subtitle, imageUrl, link, bgColor, textColor, order } = body;

    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: "Title dan image URL wajib diisi" },
        { status: 400 }
      );
    }

    const [banner] = await db
      .insert(banners)
      .values({
        title,
        subtitle,
        imageUrl,
        link: link ?? "/promo",
        bgColor: bgColor ?? "#dc2626",
        textColor: textColor ?? "#ffffff",
        order: order ?? 0,
      })
      .returning();

    return NextResponse.json({ data: banner });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
