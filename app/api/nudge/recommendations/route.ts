import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPersonalizedRecommendations, getEcoRecommendations } from "@/lib/nudge-engine";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "personalized";

  if (type === "eco") {
    const products = await getEcoRecommendations(session.user.id);
    return NextResponse.json({ data: products });
  }

  const products = await getPersonalizedRecommendations(session.user.id);
  return NextResponse.json({ data: products });
}
