import { config } from "dotenv";
config({ path: ".env.local" });

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { db } from "@/lib/db";
import * as schema from "@/drizzle/schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  console.log("Truncating existing data...");
  await db.execute(
    "TRUNCATE TABLE cart_items, order_items, product_images, nudge_logs, nudge_feedback, user_preferences, accounts, sessions, orders, carts, addresses, products, merchants, categories, users, verification_tokens CASCADE"
  );
  console.log("Truncated all tables.");

  const hashedPassword = await bcrypt.hash("password123", 10);

  const [admin] = await db
    .insert(schema.users)
    .values({
      name: "Admin Pasarku",
      email: "admin@pasarku.id",
      passwordHash: hashedPassword,
      role: "ADMIN",
      phone: "081234567890",
    })
    .returning();

  console.log("Created admin:", admin.name);

  const [buyer] = await db
    .insert(schema.users)
    .values({
      name: "Budi Pembeli",
      email: "buyer@pasarku.id",
      passwordHash: hashedPassword,
      role: "BUYER",
      phone: "081298765432",
    })
    .returning();

  console.log("Created buyer:", buyer.name);

  const [merchantUser] = await db
    .insert(schema.users)
    .values({
      name: "Pak Joko",
      email: "merchant@pasarku.id",
      passwordHash: hashedPassword,
      role: "MERCHANT",
      phone: "081211223344",
    })
    .returning();

  const [merchant] = await db
    .insert(schema.merchants)
    .values({
      userId: merchantUser.id,
      storeName: "Toko Segar",
      description: "Toko sembako dan kebutuhan dapur segar setiap hari.",
      status: "ACTIVE",
    })
    .returning();

  console.log("Created merchant:", merchant.storeName);

  const categories = await db
    .insert(schema.categories)
    .values([
      { name: "Sayuran", slug: "sayuran" },
      { name: "Buah-buahan", slug: "buah-buahan" },
      { name: "Daging & Ikan", slug: "daging-ikan" },
      { name: "Minuman", slug: "minuman" },
      { name: "Snack & Makanan Ringan", slug: "snack-makanan-ringan" },
      { name: "Bumbu Dapur", slug: "bumbu-dapur" },
    ])
    .returning();

  console.log(
    "Created categories:",
    categories.map((c) => c.name).join(", ")
  );

  const products = [
    {
      name: "Bayam Segar",
      slug: "bayam-segar-toko-segar",
      description: "Bayam hijau segar dipetik pagi hari dari petani lokal.",
      price: 5000,
      stock: 50,
      categorySlug: "sayuran",
    },
    {
      name: "Wortel Impor",
      slug: "wortel-impor-toko-segar",
      description: "Wortel segar ukuran besar, cocok untuk sup dan tumis.",
      price: 8000,
      stock: 40,
      categorySlug: "sayuran",
    },
    {
      name: "Brokoli",
      slug: "brokoli-toko-segar",
      description: "Brokoli hijau segar, kaya nutrisi.",
      price: 12000,
      stock: 30,
      categorySlug: "sayuran",
    },
    {
      name: "Apel Fuji",
      slug: "apel-fuji-toko-segar",
      description: "Apel Fuji manis dan renyah langsung dari kebun.",
      price: 15000,
      stock: 25,
      categorySlug: "buah-buahan",
    },
    {
      name: "Pisang Cavendish",
      slug: "pisang-cavendish-toko-segar",
      description: "Pisang cavendish manis, satu sisir isi 6-8 buah.",
      price: 10000,
      stock: 60,
      categorySlug: "buah-buahan",
    },
    {
      name: "Jeruk Mandarin",
      slug: "jeruk-mandarin-toko-segar",
      description: "Jeruk mandarin manis segar, 500gr per pack.",
      price: 18000,
      stock: 20,
      categorySlug: "buah-buahan",
    },
    {
      name: "Daging Ayam Fillet",
      slug: "daging-ayam-fillet-toko-segar",
      description: "Daging ayam fillet tanpa tulang, 500gr.",
      price: 25000,
      stock: 35,
      categorySlug: "daging-ikan",
    },
    {
      name: "Daging Sapi Slice",
      slug: "daging-sapi-slice-toko-segar",
      description: "Daging sapi slice tipis untuk shabu-shabu, 250gr.",
      price: 40000,
      stock: 15,
      categorySlug: "daging-ikan",
    },
    {
      name: "Ikan Salmon Fillet",
      slug: "ikan-salmon-fillet-toko-segar",
      description: "Salmon fillet segar, 200gr.",
      price: 55000,
      stock: 10,
      categorySlug: "daging-ikan",
    },
    {
      name: "Teh Botol Sosro",
      slug: "teh-botol-sosro-toko-segar",
      description: "Teh botol original, 1 karton isi 24.",
      price: 75000,
      stock: 20,
      categorySlug: "minuman",
    },
    {
      name: "Susu UHT Full Cream",
      slug: "susu-uht-full-cream-toko-segar",
      description: "Susu UHT full cream 1 liter.",
      price: 18000,
      stock: 45,
      categorySlug: "minuman",
    },
    {
      name: "Keripik Kentang",
      slug: "keripik-kentang-toko-segar",
      description: "Keripik kentang renyah rasa original, 150gr.",
      price: 12000,
      stock: 100,
      categorySlug: "snack-makanan-ringan",
    },
    {
      name: "Bawang Putih",
      slug: "bawang-putih-toko-segar",
      description: "Bawang putih segar, 250gr.",
      price: 8000,
      stock: 80,
      categorySlug: "bumbu-dapur",
    },
    {
      name: "Bawang Merah",
      slug: "bawang-merah-toko-segar",
      description: "Bawang merah segar, 250gr.",
      price: 6000,
      stock: 70,
      categorySlug: "bumbu-dapur",
    },
    {
      name: "Cabai Merah Keriting",
      slug: "cabai-merah-keriting-toko-segar",
      description: "Cabai merah keriting segar, 100gr.",
      price: 5000,
      stock: 55,
      categorySlug: "bumbu-dapur",
    },
    {
      name: "Minyak Goreng",
      slug: "minyak-goreng-toko-segar",
      description: "Minyak goreng sawit 1 liter, jernih dan berkualitas.",
      price: 18000,
      stock: 40,
      categorySlug: "bumbu-dapur",
    },
    {
      name: "Udang Segar",
      slug: "udang-segar-toko-segar",
      description: "Udang segar ukuran sedang, 500gr.",
      price: 45000,
      stock: 20,
      categorySlug: "daging-ikan",
    },
    {
      name: "Telur Ayam",
      slug: "telur-ayam-toko-segar",
      description: "Telur ayam negeri segar, 1kg isi 15-16 butir.",
      price: 25000,
      stock: 60,
      categorySlug: "daging-ikan",
    },
  ];

  const categoryMap = new Map(categories.map((c) => [c.slug, c.id]));

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const imagesJsonPath = resolve(__dirname, "seed-images.json");
  let productImagesMap: Record<string, string[]> = {};
  try {
    productImagesMap = JSON.parse(readFileSync(imagesJsonPath, "utf-8"));
    console.log("Loaded product images from seed-images.json");
  } catch {
    console.log("No seed-images.json found, using placeholder images");
  }

  for (const productData of products) {
    const categoryId = categoryMap.get(productData.categorySlug);
    if (!categoryId) continue;

    const [product] = await db
      .insert(schema.products)
      .values({
        merchantId: merchant.id,
        categoryId,
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        price: productData.price,
        stock: productData.stock,
        isActive: true,
      })
      .returning();

    const customImages = productImagesMap[productData.slug];
    if (customImages && customImages.length > 0) {
      await db.insert(schema.productImages).values(
        customImages.map((url, i) => ({
          productId: product.id,
          url,
          order: i,
        }))
      );
    } else {
      await db.insert(schema.productImages).values([
        {
          productId: product.id,
          url: `https://picsum.photos/seed/${product.slug}/400/400`,
          order: 0,
        },
        {
          productId: product.id,
          url: `https://picsum.photos/seed/${product.slug}-2/400/400`,
          order: 1,
        },
      ]);
    }

    console.log(`  Created product: ${product.name}`);
  }

  await db.insert(schema.addresses).values({
    userId: buyer.id,
    label: "Rumah",
    recipientName: "Budi Pembeli",
    phone: "081298765432",
    street: "Jl. Merdeka No. 123",
    city: "Jakarta Selatan",
    province: "DKI Jakarta",
    postalCode: "12345",
    isDefault: true,
  });

  await db.insert(schema.carts).values({
    userId: buyer.id,
  });

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
