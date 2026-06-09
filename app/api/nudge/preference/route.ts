import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import * as schema from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

type PreferenceCategoryId =
  | "sayuran_telur"
  | "buah"
  | "rumah_tangga"
  | "lainnya";
type LifestyleType = "HEMAT" | "SEHAT" | "ECO";
type ShoppingFrequency = "HARIAN" | "MINGGUAN" | "BULANAN";

const ALLOWED_CATEGORY_IDS = new Set<string>([
  "sayuran_telur",
  "buah",
  "rumah_tangga",
  "lainnya",
] satisfies PreferenceCategoryId[]);

const ALLOWED_LIFESTYLE_TYPES = new Set<string>([
  "HEMAT",
  "SEHAT",
  "ECO",
] satisfies LifestyleType[]);
const ALLOWED_SHOPPING_FREQUENCIES = new Set<string>([
  "HARIAN",
  "MINGGUAN",
  "BULANAN",
] satisfies ShoppingFrequency[]);

function normalizeFavoriteCategories(value: unknown) {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value.filter(
        (category): category is PreferenceCategoryId =>
          typeof category === "string" && ALLOWED_CATEGORY_IDS.has(category),
      ),
    ),
  );
}

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
  const {
    favoriteCategories,
    lifestyleType,
    shoppingFrequency,
    onboardingCompleted,
    onboardingSkipped,
  } = body;
  const nextFavoriteCategories = normalizeFavoriteCategories(favoriteCategories);
  const nextLifestyleType =
    typeof lifestyleType === "string" && ALLOWED_LIFESTYLE_TYPES.has(lifestyleType)
      ? (lifestyleType as LifestyleType)
      : null;
  const nextShoppingFrequency =
    typeof shoppingFrequency === "string" &&
    ALLOWED_SHOPPING_FREQUENCIES.has(shoppingFrequency)
      ? (shoppingFrequency as ShoppingFrequency)
      : null;

  const [existing] = await db
    .select()
    .from(schema.userPreferences)
    .where(eq(schema.userPreferences.userId, session.user.id))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(schema.userPreferences)
      .set({
        favoriteCategories: Array.isArray(favoriteCategories)
          ? nextFavoriteCategories
          : existing.favoriteCategories,
        lifestyleType:
          lifestyleType === undefined ? existing.lifestyleType : nextLifestyleType,
        shoppingFrequency:
          shoppingFrequency === undefined
            ? existing.shoppingFrequency
            : nextShoppingFrequency,
        onboardingCompleted:
          typeof onboardingCompleted === "boolean"
            ? onboardingCompleted
            : existing.onboardingCompleted,
        onboardingSkipped:
          typeof onboardingSkipped === "boolean"
            ? onboardingSkipped
            : existing.onboardingSkipped,
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
      favoriteCategories: nextFavoriteCategories,
      lifestyleType: nextLifestyleType,
      shoppingFrequency: nextShoppingFrequency,
      onboardingCompleted:
        typeof onboardingCompleted === "boolean" ? onboardingCompleted : false,
      onboardingSkipped:
        typeof onboardingSkipped === "boolean" ? onboardingSkipped : false,
    })
    .returning();

  return NextResponse.json({ data: created });
}
