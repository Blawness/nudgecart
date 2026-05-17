import { config } from "dotenv";
config({ path: ".env.local" });

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { db } from "@/lib/db";
import * as schema from "@/drizzle/schema";
import bcrypt from "bcryptjs";

interface UploadedImage {
  name: string;
  url: string;
}

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
      name: "Admin NudgeCart",
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

  // ------------------------------------------------------------------
  // Load real images from grocery-img.json (source of truth)
  // ------------------------------------------------------------------
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const imagesJsonPath = resolve(__dirname, "..", "grocery-img.json");
  const imagesData: UploadedImage[] = JSON.parse(
    readFileSync(imagesJsonPath, "utf-8")
  );

  const imageMap = new Map<string, string>();
  for (const img of imagesData) {
    imageMap.set(img.name.replace(".webp", ""), img.url);
  }

  console.log(`Loaded ${imageMap.size} real product images`);

  // ------------------------------------------------------------------
  // Products that MUST have a matching image in grocery-img.json
  // NO placeholders — skip if image not found.
  // ------------------------------------------------------------------
  const products = [
    {
      name: "Bayam Segar",
      slug: "bayam-segar-toko-segar",
      imageKey: "bayam-segar",
      description: "Bayam hijau segar dipetik pagi hari dari petani lokal.",
      price: 5000,
      stock: 50,
      categorySlug: "sayuran",
    },
    {
      name: "Wortel Impor",
      slug: "wortel-impor-toko-segar",
      imageKey: "wortel-lokal",
      description: "Wortel segar ukuran besar, cocok untuk sup dan tumis.",
      price: 8000,
      stock: 40,
      categorySlug: "sayuran",
    },
    {
      name: "Brokoli",
      slug: "brokoli-toko-segar",
      imageKey: "brokoli",
      description: "Brokoli hijau segar, kaya nutrisi.",
      price: 12000,
      stock: 30,
      categorySlug: "sayuran",
    },
    {
      name: "Apel Fuji",
      slug: "apel-fuji-toko-segar",
      imageKey: "apel-fuji",
      description: "Apel Fuji manis dan renyah langsung dari kebun.",
      price: 15000,
      stock: 25,
      categorySlug: "buah-buahan",
    },
    {
      name: "Pisang Cavendish",
      slug: "pisang-cavendish-toko-segar",
      imageKey: "pisang-cavendish",
      description: "Pisang cavendish manis, satu sisir isi 6-8 buah.",
      price: 10000,
      stock: 60,
      categorySlug: "buah-buahan",
    },
    {
      name: "Jeruk Mandarin",
      slug: "jeruk-mandarin-toko-segar",
      imageKey: "jeruk-mandarin",
      description: "Jeruk mandarin manis segar, 500gr per pack.",
      price: 18000,
      stock: 20,
      categorySlug: "buah-buahan",
    },
    {
      name: "Daging Ayam Fillet",
      slug: "daging-ayam-fillet-toko-segar",
      imageKey: "daging-ayam-fillet",
      description: "Daging ayam fillet tanpa tulang, 500gr.",
      price: 25000,
      stock: 35,
      categorySlug: "daging-ikan",
    },
    {
      name: "Daging Sapi Slice",
      slug: "daging-sapi-slice-toko-segar",
      imageKey: "daging-sapi-slice",
      description: "Daging sapi slice tipis untuk shabu-shabu, 250gr.",
      price: 40000,
      stock: 15,
      categorySlug: "daging-ikan",
    },
    {
      name: "Ikan Salmon Fillet",
      slug: "ikan-salmon-fillet-toko-segar",
      imageKey: "ikan-salmon-fillet",
      description: "Salmon fillet segar, 200gr.",
      price: 55000,
      stock: 10,
      categorySlug: "daging-ikan",
    },
    {
      name: "Udang Segar",
      slug: "udang-segar-toko-segar",
      imageKey: "udang-segar",
      description: "Udang segar ukuran sedang, 500gr.",
      price: 45000,
      stock: 20,
      categorySlug: "daging-ikan",
    },
    {
      name: "Telur Ayam",
      slug: "telur-ayam-toko-segar",
      imageKey: "telur-ayam",
      description: "Telur ayam negeri segar, 1kg isi 15-16 butir.",
      price: 25000,
      stock: 60,
      categorySlug: "daging-ikan",
    },
    {
      name: "Bawang Putih",
      slug: "bawang-putih-toko-segar",
      imageKey: "bawang-putih",
      description: "Bawang putih segar, 250gr.",
      price: 8000,
      stock: 80,
      categorySlug: "bumbu-dapur",
    },
    {
      name: "Cabai Merah Keriting",
      slug: "cabai-merah-keriting-toko-segar",
      imageKey: "cabai-merah-keriting",
      description: "Cabai merah keriting segar, 100gr.",
      price: 5000,
      stock: 55,
      categorySlug: "bumbu-dapur",
    },
    {
      name: "Minyak Goreng",
      slug: "minyak-goreng-toko-segar",
      imageKey: "minyak-goreng",
      description: "Minyak goreng sawit 1 liter, jernih dan berkualitas.",
      price: 18000,
      stock: 40,
      categorySlug: "bumbu-dapur",
    },
    {
      name: "Beras Premium",
      slug: "beras-premium-toko-segar",
      imageKey: "beras-premium",
      description: "Beras premium pulen, 1kg.",
      price: 16000,
      stock: 50,
      categorySlug: "bumbu-dapur",
    },
  ];

  const categoryMap = new Map(categories.map((c) => [c.slug, c.id]));

  for (const productData of products) {
    const categoryId = categoryMap.get(productData.categorySlug);
    if (!categoryId) continue;

    const imageUrl = imageMap.get(productData.imageKey);
    if (!imageUrl) {
      console.warn(`  ⚠️  Skipped: ${productData.name} — no image in grocery-img.json`);
      continue;
    }

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

    await db.insert(schema.productImages).values({
      productId: product.id,
      url: imageUrl,
      order: 0,
    });

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

  // Default banners (AI-designed images — text is baked into image)
  await db.insert(schema.banners).values([
    {
      title: "Promo Hemat",
      subtitle: "Diskon hingga 40%",
      imageUrl: "https://o76166p4ua.ufs.sh/f/vujehKPKzjOfuH2JuHhpT3aimyo7gbUz5uqdFt1XHl2wGJhk",
      link: "/promo",
      bgColor: "#dc2626",
      textColor: "#ffffff",
      order: 0,
      isActive: true,
    },
    {
      title: "Promo Cashback",
      subtitle: "Cashback Rp 10.000",
      imageUrl: "https://o76166p4ua.ufs.sh/f/vujehKPKzjOfC1uouVFduGqKyjOz0tHfbWQxm36eh7w1S5Ic",
      link: "/promo",
      bgColor: "#16a34a",
      textColor: "#ffffff",
      order: 1,
      isActive: true,
    },
    {
      title: "Promo Bundling",
      subtitle: "Paket hemat keluarga",
      imageUrl: "https://o76166p4ua.ufs.sh/f/vujehKPKzjOfdE0qq3gYmfxsiuEXJHwjD4KWe957VaP6dkrv",
      link: "/promo",
      bgColor: "#2563eb",
      textColor: "#ffffff",
      order: 2,
      isActive: true,
    },
    {
      title: "Gratis Ongkir",
      subtitle: "Pengiriman gratis",
      imageUrl: "https://o76166p4ua.ufs.sh/f/vujehKPKzjOfO4BHOn5zYQZeot136mpz2S9kXCqiAv4wJIH8",
      link: "/promo",
      bgColor: "#ea580c",
      textColor: "#ffffff",
      order: 3,
      isActive: true,
    },
  ]);
  console.log("Created 4 default banners");

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
