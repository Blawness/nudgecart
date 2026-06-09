import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, and, inArray } from "drizzle-orm";
import { requireRole } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import {
  merchants,
  products,
  productImages,
  categories,
} from "@/drizzle/schema";
import { generateSlug } from "@/lib/utils";

const createProductSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi"),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  price: z.number().positive("Harga harus lebih dari 0"),
  stock: z.number().min(0, "Stok tidak boleh negatif"),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  imageUrls: z.array(z.string()).optional(),
  isEcoFriendly: z.boolean().optional(),
  ecoLabel: z.string().optional(),
  ecoTooltip: z.string().optional(),
  carbonFootprint: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { user: authUser, error } = await requireRole("MERCHANT");
    if (error) return error;
    const userId = authUser.id;

    const [merchant] = await db
      .select()
      .from(merchants)
      .where(eq(merchants.userId, userId))
      .limit(1);

    if (!merchant) {
      return NextResponse.json(
        { error: "Merchant tidak ditemukan" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const isActiveParam = searchParams.get("isActive");

    const conditions = [eq(products.merchantId, merchant.id)];

    if (isActiveParam !== null) {
      const isActive = isActiveParam === "true";
      conditions.push(eq(products.isActive, isActive));
    }

    const productList = await db
      .select()
      .from(products)
      .where(and(...conditions))
      .orderBy(products.createdAt);

    if (productList.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const productIds = productList.map((p) => p.id);

    const imgs =
      productIds.length > 0
        ? await db
            .select()
            .from(productImages)
            .where(inArray(productImages.productId, productIds))
        : [];

    const categoryIds = [...new Set(productList.map((p) => p.categoryId))];
    const categoryList =
      categoryIds.length > 0
        ? await db
            .select()
            .from(categories)
            .where(inArray(categories.id, categoryIds))
        : [];

    const result = productList.map((product) => {
      const images = imgs
        .filter((img) => img.productId === product.id)
        .sort((a, b) => a.order - b.order)
        .map((img) => img.url);
      const category = categoryList.find(
        (cat) => cat.id === product.categoryId
      );
      return {
        ...product,
        images,
        category: category ?? null,
      };
    });

    return NextResponse.json({ data: result });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { user: authUser, error } = await requireRole("MERCHANT");
    if (error) return error;
    const userId = authUser.id;

    const [merchant] = await db
      .select()
      .from(merchants)
      .where(eq(merchants.userId, userId))
      .limit(1);

    if (!merchant) {
      return NextResponse.json(
        { error: "Merchant tidak ditemukan" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data produk tidak valid" },
        { status: 400 }
      );
    }

    const { name, description, price, stock, categoryId, imageUrls, isEcoFriendly, ecoLabel, ecoTooltip, carbonFootprint } =
      parsed.data;

    const slug = generateSlug(name);

    const [product] = await db
      .insert(products)
      .values({
        merchantId: merchant.id,
        categoryId,
        name,
        slug,
        description,
        price,
        stock,
        isActive: true,
        isEcoFriendly: isEcoFriendly ?? false,
        ecoLabel: (ecoLabel ?? null) as "FRESH" | "ECONOMICAL" | "POPULAR" | null,
        ecoTooltip: ecoTooltip ?? null,
        carbonFootprint: carbonFootprint ? Number(carbonFootprint) : null,
      } as never)
      .returning();

    if (imageUrls && imageUrls.length > 0) {
      await db.insert(productImages).values(
        imageUrls.map((url, index) => ({
          productId: product.id,
          url,
          order: index,
        }))
      );
    }

    const result = {
      ...product,
      images: imageUrls ?? [],
    };

    return NextResponse.json({ data: result }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
