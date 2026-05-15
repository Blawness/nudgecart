import Link from "next/link";
import { db } from "@/lib/db";
import { categories } from "@/drizzle/schema";

const CIRCLE_BG = [
  "bg-green-100",
  "bg-orange-100",
  "bg-sky-100",
  "bg-yellow-100",
  "bg-red-100",
  "bg-purple-100",
  "bg-cyan-100",
  "bg-pink-100",
  "bg-lime-100",
  "bg-amber-100",
  "bg-indigo-100",
  "bg-rose-100",
];

const CATEGORY_EMOJI: Record<string, string> = {
  sayur: "🥬",
  buah: "🍎",
  daging: "🥩",
  seafood: "🐟",
  ikan: "🐟",
  unggas: "🍗",
  ayam: "🍗",
  bakery: "🥖",
  roti: "🥖",
  protein: "🥚",
  telur: "🥚",
  susu: "🥛",
  dairy: "🥛",
  minuman: "🧃",
  snack: "🍪",
  frozen: "🧊",
  beku: "🧊",
  bumbu: "🌿",
  beras: "🍚",
  minyak: "🫙",
};

function getCategoryEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(CATEGORY_EMOJI)) {
    if (lower.includes(key)) return emoji;
  }
  return "🛒";
}

export default async function CategoriesPage() {
  const allCategories = await db
    .select()
    .from(categories)
    .orderBy(categories.name);

  return (
    <div className="px-4 py-6">
      <h1 className="mb-5 text-lg font-bold text-gray-900">Semua Kategori</h1>

      {allCategories.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Belum ada kategori tersedia.
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-x-3 gap-y-5 sm:grid-cols-6 lg:grid-cols-8">
          {allCategories.map((category, index) => {
            const bg = CIRCLE_BG[index % CIRCLE_BG.length];
            const emoji = getCategoryEmoji(category.name);

            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group flex flex-col items-center gap-2"
              >
                <div
                  className={`flex size-16 items-center justify-center rounded-full transition-all group-hover:scale-105 group-hover:ring-2 group-hover:ring-primary group-hover:ring-offset-2 ${bg}`}
                >
                  <span
                    className="text-2xl leading-none"
                    role="img"
                    aria-label={category.name}
                  >
                    {emoji}
                  </span>
                </div>
                <span className="line-clamp-2 text-center text-xs font-medium leading-tight text-gray-700 group-hover:text-primary">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
