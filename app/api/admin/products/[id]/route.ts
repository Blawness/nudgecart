import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { products, productImages, categories, merchants } from "@/drizzle/schema";

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  stock: z.number().min(0).optional(),
  categoryId: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  imageUrls: z.array(z.string()).optional(),
});

// GET single product (admin)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userRole = (session?.user as Record<string, unknown>)?.role as string | undefined;

    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
    }

    const { id } = await params;

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    const imgs = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, id))
      .orderBy(productImages.order);

    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, product.categoryId))
      .limit(1);

    const [merchant] = await db
      .select()
      .from(merchants)
      .where(eq(merchants.id, product.merchantId))
      .limit(1);

    const result = {
      ...product,
      images: imgs.map((img) => img.url),
      category: category ?? null,
      merchant: merchant ?? null,
    };

    return NextResponse.json({ data: result });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

// PUT update product (admin)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userRole = (session?.user as Record<string, unknown>)?.role as string | undefined;

    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
    }

    const { id } = await params;

    const [existingProduct] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!existingProduct) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Data produk tidak valid" }, { status: 400 });
    }

    const { imageUrls, ...updateFields } = parsed.data;

    if (Object.keys(updateFields).length > 0) {
      await db
        .update(products)
        .set({ ...updateFields, updatedAt: new Date() })
        .where(eq(products.id, id));
    }

    if (imageUrls !== undefined) {
      await db.delete(productImages).where(eq(productImages.productId, id));

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
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
