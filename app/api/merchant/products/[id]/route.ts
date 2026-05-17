import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  merchants,
  products,
  productImages,
} from "@/drizzle/schema";

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  stock: z.number().min(0).optional(),
  categoryId: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  isEcoFriendly: z.boolean().optional(),
  ecoLabel: z.string().optional(),
  ecoTooltip: z.string().optional(),
  carbonFootprint: z.union([z.number(), z.string()]).optional(),
  imageUrls: z.array(z.string()).optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const role = (session?.user as unknown as Record<string, unknown>)?.role as
      | string
      | undefined;
    const userId = session?.user?.id;

    if (role !== "MERCHANT" || !userId) {
      return NextResponse.json(
        { error: "Tidak memiliki akses" },
        { status: 403 }
      );
    }

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

    const { id } = await params;

    const [existingProduct] = await db
      .select()
      .from(products)
      .where(
        and(eq(products.id, id), eq(products.merchantId, merchant.id))
      )
      .limit(1);

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data produk tidak valid" },
        { status: 400 }
      );
    }

    const { imageUrls, carbonFootprint, ...restFields } = parsed.data;
    const updateFields = {
      ...restFields,
      carbonFootprint: carbonFootprint
        ? typeof carbonFootprint === "string"
          ? Number(carbonFootprint)
          : carbonFootprint
        : undefined,
    };

    if (Object.keys(updateFields).length > 0) {
      await db
        .update(products)
        .set({ ...updateFields, updatedAt: new Date() } as never)
        .where(
          and(
            eq(products.id, id),
            eq(products.merchantId, merchant.id)
          )
        );
    }

    if (imageUrls !== undefined) {
      await db
        .delete(productImages)
        .where(eq(productImages.productId, id));

      if (imageUrls.length > 0) {
        await db.insert(productImages).values(
          imageUrls.map((url, index) => ({
            productId: id,
            url,
            order: index,
          }))
        );
      }
    }

    const [updatedProduct] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    const imgs = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, id))
      .orderBy(productImages.order);

    const result = {
      ...updatedProduct,
      images: imgs.map((img) => img.url),
    };

    return NextResponse.json({ data: result });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const role = (session?.user as unknown as Record<string, unknown>)?.role as
      | string
      | undefined;
    const userId = session?.user?.id;

    if (role !== "MERCHANT" || !userId) {
      return NextResponse.json(
        { error: "Tidak memiliki akses" },
        { status: 403 }
      );
    }

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

    const { id } = await params;

    const [existingProduct] = await db
      .select()
      .from(products)
      .where(
        and(eq(products.id, id), eq(products.merchantId, merchant.id))
      )
      .limit(1);

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    await db
      .update(products)
      .set({ isActive: false, updatedAt: new Date() })
      .where(
        and(
          eq(products.id, id),
          eq(products.merchantId, merchant.id)
        )
      );

    const [updatedProduct] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    return NextResponse.json({ data: updatedProduct });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
