import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { carts, cartItems, products, merchants, productImages } from "@/drizzle/schema";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const [cart] = await db
      .select({ id: carts.id })
      .from(carts)
      .where(eq(carts.userId, session.user.id))
      .limit(1);

    if (!cart) {
      await db.insert(carts).values({ userId: session.user.id });
      return NextResponse.json({
        data: { id: "", items: [] },
      });
    }

    const items = await db
      .select({
        id: cartItems.id,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        bundleId: cartItems.bundleId,
        bundleName: cartItems.bundleName,
        bundleType: cartItems.bundleType,
        bundlePrice: cartItems.bundlePrice,
        bundleNormalTotal: cartItems.bundleNormalTotal,
        bundleItems: cartItems.bundleItems,
        productName: products.name,
        price: products.price,
        stock: products.stock,
        merchantId: merchants.id,
        merchantName: merchants.storeName,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .innerJoin(merchants, eq(products.merchantId, merchants.id))
      .where(eq(cartItems.cartId, cart.id));

    const productIds = [...new Set(items.map((item) => item.productId))];

    const images =
      productIds.length > 0
        ? await db
            .select({
              productId: productImages.productId,
              url: productImages.url,
            })
            .from(productImages)
            .where(inArray(productImages.productId, productIds))
            .orderBy(productImages.order)
        : [];

    const imageMap = new Map<string, string>();
    for (const img of images) {
      if (!imageMap.has(img.productId)) {
        imageMap.set(img.productId, img.url);
      }
    }

    const mappedItems = items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.bundleName ?? item.productName,
      price: item.bundlePrice ?? item.price,
      stock: item.stock,
      imageUrl: imageMap.get(item.productId) ?? "/placeholder.png",
      quantity: item.quantity,
      merchantId: item.merchantId,
      merchantName: item.merchantName,
      bundleId: item.bundleId,
      bundleType: item.bundleType,
      bundleNormalTotal: item.bundleNormalTotal,
      bundleItems: item.bundleItems ?? [],
    }));

    return NextResponse.json({
      data: {
        id: cart.id,
        items: mappedItems,
      },
    });
  } catch {
    return NextResponse.json({ error: "Gagal memuat keranjang" }, { status: 500 });
  }
}
