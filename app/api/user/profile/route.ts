import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import * as schema from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, phone, avatarUrl } = body;

  const [user] = await db
    .update(schema.users)
    .set({
      name: name ?? undefined,
      phone: phone ?? undefined,
      avatarUrl: avatarUrl ?? undefined,
      updatedAt: new Date(),
    })
    .where(eq(schema.users.id, session.user.id))
    .returning({ id: schema.users.id, name: schema.users.name, email: schema.users.email, phone: schema.users.phone, avatarUrl: schema.users.avatarUrl });

  return NextResponse.json({ data: user });
}
