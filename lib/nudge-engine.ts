import { db } from "./db";
import * as schema from "@/drizzle/schema";
import { eq, and, sql, gte, desc, lt, or, not } from "drizzle-orm";
import type { NudgeDecision, NudgeContext, NudgeType, NudgeFraming } from "@/types";

async function isInCooldown(userId: string): Promise<boolean> {
  const lastDismiss = await db
    .select()
    .from(schema.nudgeLogs)
    .where(
      and(
        eq(schema.nudgeLogs.userId, userId),
        eq(schema.nudgeLogs.event, "NUDGE_DISMISSED"),
        gte(schema.nudgeLogs.createdAt, sql`NOW() - INTERVAL '24 hours'`)
      )
    )
    .orderBy(desc(schema.nudgeLogs.createdAt))
    .limit(1);

  return lastDismiss.length > 0;
}

async function countNudgeTypeLast7Days(
  userId: string,
  nudgeType: NudgeType
): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.nudgeLogs)
    .where(
      and(
        eq(schema.nudgeLogs.userId, userId),
        eq(schema.nudgeLogs.nudgeType, nudgeType),
        gte(schema.nudgeLogs.createdAt, sql`NOW() - INTERVAL '7 days'`)
      )
    );

  return result[0]?.count ?? 0;
}

export function determineFraming(context: NudgeContext): NudgeFraming | null {
  if (context === "HOME" || context === "PRODUCT_DETAIL") return "GAIN";
  if (context === "CART" || context === "CHECKOUT") return "LOSS";
  if (context === "POST_PURCHASE") return "GAIN";
  return null;
}

async function findAlternativeEcoProduct(
  productId: string
): Promise<{
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
} | null> {
  const [product] = await db
    .select({
      id: schema.products.id,
      categoryId: schema.products.categoryId,
    })
    .from(schema.products)
    .where(eq(schema.products.id, productId))
    .limit(1);

  if (!product) return null;

  const [ecoAlt] = await db
    .select({
      id: schema.products.id,
      name: schema.products.name,
      slug: schema.products.slug,
      price: schema.products.price,
      imageUrl: schema.productImages.url,
    })
    .from(schema.products)
    .leftJoin(
      schema.productImages,
      and(
        eq(schema.productImages.productId, schema.products.id),
        eq(schema.productImages.order, 0)
      )
    )
    .where(
      and(
        eq(schema.products.categoryId, product.categoryId),
        eq(schema.products.isEcoFriendly, true),
        eq(schema.products.isActive, true),
        not(eq(schema.products.id, productId))
      )
    )

    .limit(1);

  if (!ecoAlt) return null;

  return {
    id: ecoAlt.id,
    name: ecoAlt.name,
    slug: ecoAlt.slug,
    price: ecoAlt.price,
    imageUrl: ecoAlt.imageUrl ?? "",
  };
}

async function findCheaperAlternative(
  productId: string
): Promise<{
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
} | null> {
  const [product] = await db
    .select({
      id: schema.products.id,
      price: schema.products.price,
      categoryId: schema.products.categoryId,
    })
    .from(schema.products)
    .where(eq(schema.products.id, productId))
    .limit(1);

  if (!product) return null;

  const [cheaper] = await db
    .select({
      id: schema.products.id,
      name: schema.products.name,
      slug: schema.products.slug,
      price: schema.products.price,
      imageUrl: schema.productImages.url,
    })
    .from(schema.products)
    .leftJoin(
      schema.productImages,
      and(
        eq(schema.productImages.productId, schema.products.id),
        eq(schema.productImages.order, 0)
      )
    )
    .where(
      and(
        eq(schema.products.categoryId, product.categoryId),
        eq(schema.products.isActive, true),
        lt(schema.products.price, product.price),
        not(eq(schema.products.id, productId))
      )
    )
    .orderBy(schema.products.price)
    .limit(1);

  if (!cheaper) return null;

  return {
    id: cheaper.id,
    name: cheaper.name,
    slug: cheaper.slug,
    price: cheaper.price,
    imageUrl: cheaper.imageUrl ?? "",
  };
}

export const nudgeTemplates: Record<string, { headline: string; body: string; ctaText: string }> = {
  PRE_CHECKOUT_ECO: {
    headline: "Lengkapi dengan produk ramah lingkungan",
    body: "Tambahkan 1 produk ramah lingkungan untuk melengkapi belanjaanmu.",
    ctaText: "Lihat Produk",
  },
  PRE_CHECKOUT_ONGKIR: {
    headline: "Gratis Ongkir menantimu!",
    body: "Tambahkan Rp {amount} lagi untuk gratis ongkir.",
    ctaText: "Lanjut Belanja",
  },
  LAST_CHANCE_ECO_ALT: {
    headline: "Versi ramah lingkungan tersedia",
    body: "Versi ramah lingkungan tersedia untuk {product}.",
    ctaText: "Lihat Alternatif",
  },
  LAST_CHANCE_CARBON: {
    headline: "Kontribusi kamu",
    body: "Dengan belanja produk ini, kamu berkontribusi mengurangi {carbon} kg emisi karbon.",
    ctaText: "",
  },
  POST_PURCHASE_THANKS: {
    headline: "Terima kasih!",
    body: "Dengan memilih {product}, kamu telah berkontribusi untuk lingkungan yang lebih baik.",
    ctaText: "Lihat Rekomendasi",
  },
  POST_PURCHASE_COUNTER: {
    headline: "Pencapaian kamu!",
    body: "Ini pembelian ramah lingkungan ke-{count} kamu bulan ini!",
    ctaText: "",
  },
};

export async function evaluateNudge(params: {
  userId: string;
  context: NudgeContext;
  productId?: string;
  popupAlreadyShown: boolean;
}): Promise<NudgeDecision> {
  const { userId, context, productId, popupAlreadyShown } = params;

  const cooldown = await isInCooldown(userId);
  if (cooldown) {
    return { shouldShow: false, nudgeType: null, framingType: null, content: null };
  }

  const framing = determineFraming(context);

  if (context === "PRODUCT_DETAIL" && productId) {
    if (popupAlreadyShown) {
      return { shouldShow: false, nudgeType: null, framingType: null, content: null };
    }

    const count = await countNudgeTypeLast7Days(userId, "JUST_IN_TIME");
    if (count >= 2) {
      return { shouldShow: false, nudgeType: null, framingType: null, content: null };
    }

    const ecoAlt = await findAlternativeEcoProduct(productId);
    if (ecoAlt) {
      const template = nudgeTemplates.LAST_CHANCE_ECO_ALT;
      return {
        shouldShow: true,
        nudgeType: "JUST_IN_TIME",
        framingType: framing,
        content: {
          headline: template.headline,
          body: template.body.replace("{product}", ecoAlt.name),
          ctaText: template.ctaText,
          alternativeProduct: {
            id: ecoAlt.id,
            name: ecoAlt.name,
            slug: ecoAlt.slug,
            price: ecoAlt.price,
            imageUrl: ecoAlt.imageUrl ?? "",
          },
        },
      };
    }

    const cheaper = await findCheaperAlternative(productId);
    if (cheaper) {
      return {
        shouldShow: true,
        nudgeType: "JUST_IN_TIME",
        framingType: framing,
        content: {
          headline: "Alternatif lebih hemat tersedia",
          body: `Kamu bisa hemat dengan memilih ${cheaper.name}.`,
          ctaText: "Ganti Produk",
          alternativeProduct: {
            id: cheaper.id,
            name: cheaper.name,
            slug: cheaper.slug,
            price: cheaper.price,
            imageUrl: cheaper.imageUrl ?? "",
          },
        },
      };
    }
  }

  if (context === "CART") {
    const template = nudgeTemplates.PRE_CHECKOUT_ECO;
    return {
      shouldShow: true,
      nudgeType: "PRE_CHECKOUT",
      framingType: framing,
      content: {
        headline: template.headline,
        body: template.body,
        ctaText: template.ctaText,
      },
    };
  }

  if (context === "CHECKOUT") {
    const template = nudgeTemplates.LAST_CHANCE_CARBON;
    return {
      shouldShow: true,
      nudgeType: "LAST_CHANCE",
      framingType: framing,
      content: {
        headline: template.headline,
        body: template.body.replace("{carbon}", "0.3"),
        ctaText: template.ctaText,
      },
    };
  }

  if (context === "POST_PURCHASE") {
    const template = nudgeTemplates.POST_PURCHASE_THANKS;
    return {
      shouldShow: true,
      nudgeType: "POST_PURCHASE",
      framingType: framing,
      content: {
        headline: template.headline,
        body: template.body.replace("{product}", "produk ini"),
        ctaText: template.ctaText,
      },
    };
  }

  return { shouldShow: false, nudgeType: null, framingType: null, content: null };
}

export async function logNudgeEvent(params: {
  userId: string;
  sessionId: string;
  nudgeType: NudgeType;
  framingType: NudgeFraming | null;
  nudgeContext: NudgeContext;
  event: "NUDGE_DISPLAYED" | "NUDGE_ACCEPTED" | "NUDGE_DISMISSED" | "ECO_PURCHASE" | "PROMO_PERSONAL_CLICK";
  productId?: string;
  alternativeProductId?: string;
}) {
  await db.insert(schema.nudgeLogs).values({
    userId: params.userId,
    sessionId: params.sessionId,
    nudgeType: params.nudgeType,
    framingType: params.framingType,
    nudgeContext: params.nudgeContext,
    event: params.event,
    productId: params.productId ?? null,
    alternativeProductId: params.alternativeProductId ?? null,
  });
}

export async function getUserPreferences(userId: string) {
  const [pref] = await db
    .select()
    .from(schema.userPreferences)
    .where(eq(schema.userPreferences.userId, userId))
    .limit(1);

  return pref ?? null;
}

export async function getPersonalizedRecommendations(
  userId: string,
  limit = 10
): Promise<Array<{
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  storeName: string;
  merchantId: string;
  isEcoFriendly: boolean;
  ecoLabel: string | null;
  imageUrl: string | null;
}>> {
  const pref = await getUserPreferences(userId);

  if (pref && pref.favoriteCategories.length > 0) {
    const recs = await db
      .select({
        id: schema.products.id,
        name: schema.products.name,
        slug: schema.products.slug,
        price: schema.products.price,
        stock: schema.products.stock,
        imageUrl: schema.productImages.url,
        storeName: schema.merchants.storeName,
        merchantId: schema.merchants.id,
        isEcoFriendly: schema.products.isEcoFriendly,
        ecoLabel: schema.products.ecoLabel,
      })
      .from(schema.products)
      .innerJoin(
        schema.merchants,
        eq(schema.products.merchantId, schema.merchants.id)
      )
      .leftJoin(
        schema.productImages,
        and(
          eq(schema.productImages.productId, schema.products.id),
          eq(schema.productImages.order, 0)
        )
      )
      .where(
        and(
          eq(schema.products.isActive, true),
          sql`${schema.products.categoryId} = ANY(${pref.favoriteCategories}::uuid[])`
        )
      )
      .orderBy(desc(schema.products.createdAt))
      .limit(limit);

    if (recs.length > 0) return recs;
  }

  const fallback = await db
    .select({
      id: schema.products.id,
      name: schema.products.name,
      slug: schema.products.slug,
      price: schema.products.price,
      stock: schema.products.stock,
      imageUrl: schema.productImages.url,
      storeName: schema.merchants.storeName,
      merchantId: schema.merchants.id,
      isEcoFriendly: schema.products.isEcoFriendly,
      ecoLabel: schema.products.ecoLabel,
    })
    .from(schema.products)
    .innerJoin(
      schema.merchants,
      eq(schema.products.merchantId, schema.merchants.id)
    )
    .leftJoin(
      schema.productImages,
      and(
        eq(schema.productImages.productId, schema.products.id),
        eq(schema.productImages.order, 0)
      )
    )
    .where(eq(schema.products.isActive, true))
    .orderBy(desc(schema.products.createdAt))
    .limit(limit);

  return fallback;
}

export async function getEcoRecommendations(
  userId: string,
  limit = 6
): Promise<Array<{
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  storeName: string;
  merchantId: string;
  isEcoFriendly: boolean;
  ecoLabel: string | null;
}>> {
  const pref = await getUserPreferences(userId);
  const categoryIds = pref?.favoriteCategories ?? [];

  const conditions = [
    eq(schema.products.isEcoFriendly, true),
    eq(schema.products.isActive, true),
  ];

  if (categoryIds.length > 0) {
    conditions.push(
      sql`${schema.products.categoryId} = ANY(${categoryIds}::uuid[])` as ReturnType<typeof sql>
    );
  }

  return db
    .select({
      id: schema.products.id,
      name: schema.products.name,
      slug: schema.products.slug,
      price: schema.products.price,
      stock: schema.products.stock,
      imageUrl: schema.productImages.url,
      storeName: schema.merchants.storeName,
      merchantId: schema.merchants.id,
      isEcoFriendly: schema.products.isEcoFriendly,
      ecoLabel: schema.products.ecoLabel,
    })
    .from(schema.products)
    .innerJoin(
      schema.merchants,
      eq(schema.products.merchantId, schema.merchants.id)
    )
    .leftJoin(
      schema.productImages,
      and(
        eq(schema.productImages.productId, schema.products.id),
        eq(schema.productImages.order, 0)
      )
    )
    .where(and(...conditions))
    .orderBy(desc(schema.products.createdAt))
    .limit(limit);
}

export async function getEcoPurchaseCount(userId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.nudgeLogs)
    .where(
      and(
        eq(schema.nudgeLogs.userId, userId),
        eq(schema.nudgeLogs.event, "ECO_PURCHASE"),
        gte(
          schema.nudgeLogs.createdAt,
          sql`DATE_TRUNC('month', CURRENT_DATE)`
        )
      )
    );

  return result[0]?.count ?? 0;
}

export async function getNudgeInteractionCount(
  userId: string,
  sessionId: string
): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.nudgeLogs)
    .where(
      and(
        eq(schema.nudgeLogs.userId, userId),
        eq(schema.nudgeLogs.sessionId, sessionId),
        or(
          eq(schema.nudgeLogs.event, "NUDGE_DISPLAYED"),
          eq(schema.nudgeLogs.event, "NUDGE_ACCEPTED"),
          eq(schema.nudgeLogs.event, "NUDGE_DISMISSED")
        )
      )
    );

  return result[0]?.count ?? 0;
}

export async function getNudgeAnalytics(): Promise<{
  totalDisplayed: number;
  totalAccepted: number;
  totalDismissed: number;
  acceptanceRate: number;
  byType: Array<{
    nudgeType: string;
    displayed: number;
    accepted: number;
    rate: number;
  }>;
  ecoPurchaseCount: number;
}> {
  const [displayed] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.nudgeLogs)
    .where(eq(schema.nudgeLogs.event, "NUDGE_DISPLAYED"));

  const [accepted] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.nudgeLogs)
    .where(eq(schema.nudgeLogs.event, "NUDGE_ACCEPTED"));

  const [dismissed] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.nudgeLogs)
    .where(eq(schema.nudgeLogs.event, "NUDGE_DISMISSED"));

  const [ecoPurchase] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.nudgeLogs)
    .where(eq(schema.nudgeLogs.event, "ECO_PURCHASE"));

  const byType = await db
    .select({
      nudgeType: schema.nudgeLogs.nudgeType,
      displayed: sql<number>`count(*) FILTER (WHERE ${schema.nudgeLogs.event} = 'NUDGE_DISPLAYED')`,
      accepted: sql<number>`count(*) FILTER (WHERE ${schema.nudgeLogs.event} = 'NUDGE_ACCEPTED')`,
    })
    .from(schema.nudgeLogs)
    .groupBy(schema.nudgeLogs.nudgeType);

  const totalDisplayed = displayed?.count ?? 0;
  const totalAccepted = accepted?.count ?? 0;

  return {
    totalDisplayed,
    totalAccepted: totalAccepted,
    totalDismissed: dismissed?.count ?? 0,
    acceptanceRate: totalDisplayed > 0 ? totalAccepted / totalDisplayed : 0,
    byType: byType.map((t) => ({
      nudgeType: t.nudgeType,
      displayed: Number(t.displayed),
      accepted: Number(t.accepted),
      rate: Number(t.displayed) > 0 ? Number(t.accepted) / Number(t.displayed) : 0,
    })),
    ecoPurchaseCount: ecoPurchase?.count ?? 0,
  };
}
