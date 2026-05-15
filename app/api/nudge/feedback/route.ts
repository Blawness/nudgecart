import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import * as schema from "@/drizzle/schema";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { sessionId, rating } = body;

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating harus antara 1-5" }, { status: 400 });
  }

  const [fb] = await db
    .insert(schema.nudgeFeedback)
    .values({
      userId: session.user.id,
      sessionId: sessionId || "unknown",
      rating,
    })
    .returning();

  return NextResponse.json({ data: fb });
}
