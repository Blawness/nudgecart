import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { logNudgeEvent as logEvent } from "@/lib/nudge-engine";
import { db } from "@/lib/db";
import * as schema from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import type { NudgeType, NudgeFraming, NudgeContext, NudgeEvent } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logs = await db
    .select()
    .from(schema.nudgeLogs)
    .where(eq(schema.nudgeLogs.userId, session.user.id))
    .orderBy(desc(schema.nudgeLogs.createdAt))
    .limit(100);

  return NextResponse.json({ data: logs });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    sessionId,
    nudgeType,
    framingType,
    nudgeContext,
    event,
    productId,
    alternativeProductId,
  } = body;

  await logEvent({
    userId: session.user.id,
    sessionId,
    nudgeType: nudgeType as NudgeType,
    framingType: (framingType as NudgeFraming) ?? null,
    nudgeContext: nudgeContext as NudgeContext,
    event: event as NudgeEvent,
    productId,
    alternativeProductId,
  });

  return NextResponse.json({ data: { success: true } });
}
