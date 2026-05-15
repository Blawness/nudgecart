import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { categories } from "@/drizzle/schema";
import { generateSlug } from "@/lib/utils";

const createCategorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi"),
  slug: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Data tidak valid";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name } = parsed.data;
    const slug = parsed.data.slug || generateSlug(name);

    const [category] = await db
      .insert(categories)
      .values({ name, slug })
      .returning();

    return NextResponse.json({ data: category }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
