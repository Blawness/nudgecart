import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, merchants } from "@/drizzle/schema";

const merchantRegisterSchema = z.object({
  name: z.string().min(1),
  email: z.string().min(1).email(),
  storeName: z.string().min(1),
  storeDescription: z.string().min(1),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = merchantRegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    const { name, email, storeName, storeDescription, password } = parsed.data;

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [user] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        role: "MERCHANT",
      })
      .returning();

    await db.insert(merchants).values({
      userId: user.id,
      storeName,
      description: storeDescription,
      status: "PENDING",
    });

    return NextResponse.json(
      {
        data: {
          message: "Pendaftaran berhasil. Menunggu approval admin.",
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
