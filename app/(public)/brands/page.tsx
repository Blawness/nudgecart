import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { merchants, users } from "@/drizzle/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store } from "lucide-react";

export const metadata: Metadata = {
  title: "Brand - NudgeCart",
};

export default async function BrandsPage() {
  const allMerchants = await db
    .select({
      id: merchants.id,
      storeName: merchants.storeName,
      description: merchants.description,
      logoUrl: merchants.logoUrl,
    })
    .from(merchants)
    .innerJoin(users, eq(merchants.userId, users.id))
    .where(eq(merchants.status, "ACTIVE"))
    .orderBy(merchants.storeName);

  return (
    <div className="px-4 py-6">
      <h1 className="mb-5 text-lg font-bold text-gray-900">Semua Brand</h1>

      {allMerchants.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Belum ada brand
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {allMerchants.map((merchant) => (
            <Link
              key={merchant.id}
              href={`/merchants/${merchant.id}`}
              className="group"
            >
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader className="items-center gap-3 pb-2">
                  {merchant.logoUrl ? (
                    <div className="relative size-20 overflow-hidden rounded-full bg-muted">
                      <Image
                        src={merchant.logoUrl}
                        alt={merchant.storeName}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  ) : (
                    <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
                      <Store className="size-8 text-primary" />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="text-center">
                  <CardTitle className="mb-1 group-hover:text-primary">
                    {merchant.storeName}
                  </CardTitle>
                  {merchant.description && (
                    <CardDescription className="line-clamp-2">
                      {merchant.description}
                    </CardDescription>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
