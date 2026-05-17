import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getNudgeAnalytics } from "@/lib/nudge-engine";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as unknown as Record<string, unknown>)?.role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const analytics = await getNudgeAnalytics();
  return NextResponse.json({ data: analytics });
}
