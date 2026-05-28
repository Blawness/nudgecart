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

  const [pref] = await db
    .select()
    .from(schema.userPreferences)
    .where(eq(schema.userPreferences.userId, session.user.id))
    .limit(1);

  return NextResponse.json({ data: pref ?? null });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { favoriteCategories, lifestyleType, shoppingFrequency, onboardingCompleted, onboardingSkipped } = body;

  const [existing] = await db
    .select()
    .from(schema.userPreferences)
    .where(eq(schema.userPreferences.userId, session.user.id))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(schema.userPreferences)
      .set({
        favoriteCategories: favoriteCategories ?? existing.favoriteCategories,
        lifestyleType: lifestyleType ?? existing.lifestyleType,
        shoppingFrequency: shoppingFrequency ?? existing.shoppingFrequency,
        onboardingCompleted: onboardingCompleted ?? existing.onboardingCompleted,
        onboardingSkipped: onboardingSkipped ?? existing.onboardingSkipped,
        updatedAt: new Date(),
      })
      .where(eq(schema.userPreferences.userId, session.user.id))
      .returning();

    return NextResponse.json({ data: updated });
  }

  const [created] = await db
    .insert(schema.userPreferences)
    .values({
      userId: session.user.id,
      favoriteCategories: favoriteCategories ?? [],
      lifestyleType: lifestyleType ?? null,
      shoppingFrequency: shoppingFrequency ?? null,
      onboardingCompleted: onboardingCompleted ?? false,
      onboardingSkipped: onboardingSkipped ?? false,
    })
    .returning();

  return NextResponse.json({ data: created });
}
