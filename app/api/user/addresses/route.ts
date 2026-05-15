import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import * as schema from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const addresses = await db
    .select()
    .from(schema.addresses)
    .where(eq(schema.addresses.userId, session.user.id))
    .orderBy(schema.addresses.isDefault);

  return NextResponse.json({ data: addresses });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { label, recipientName, phone, street, city, province, postalCode } = body;

  if (!label || !recipientName || !phone || !street || !city || !province || !postalCode) {
    return NextResponse.json({ error: "Semua field alamat harus diisi" }, { status: 400 });
  }

  const existingCount = await db
    .select()
    .from(schema.addresses)
    .where(eq(schema.addresses.userId, session.user.id));

  const [address] = await db
    .insert(schema.addresses)
    .values({
      userId: session.user.id,
      label,
      recipientName,
      phone,
      street,
      city,
      province,
      postalCode,
      isDefault: existingCount.length === 0,
    })
    .returning();

  return NextResponse.json({ data: address });
}
