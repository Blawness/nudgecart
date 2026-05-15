import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/drizzle/schema";

export async function GET() {
  try {
    const result = await db.select().from(categories).orderBy(categories.name);
    return NextResponse.json({ data: result });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
