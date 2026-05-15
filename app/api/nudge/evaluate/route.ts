import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { evaluateNudge, logNudgeEvent } from "@/lib/nudge-engine";
import type { NudgeContext } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { sessionId, context, productId, popupAlreadyShown } = body;

  const decision = await evaluateNudge({
    userId: session.user.id,
    context: context as NudgeContext,
    productId,
    popupAlreadyShown: popupAlreadyShown ?? false,
  });

  if (decision.shouldShow && decision.nudgeType) {
    await logNudgeEvent({
      userId: session.user.id,
      sessionId: sessionId || "unknown",
      nudgeType: decision.nudgeType,
      framingType: decision.framingType,
      nudgeContext: context as NudgeContext,
      event: "NUDGE_DISPLAYED",
      productId,
    });
  }

  return NextResponse.json({ data: decision });
}
