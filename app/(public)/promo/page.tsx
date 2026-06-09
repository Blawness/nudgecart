import type { Metadata } from "next";
import { BundlePackageCard } from "@/components/promo/BundlePackageCard";
import {
  promoBundles,
  promoFilterChips,
  promoTabs,
  type PromoBundleType,
} from "@/lib/promo-bundles";
import { formatRupiah } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Promo - NudgeCart",
  description: "Promo package dan tebus murah dari NudgeCart",
};

function bundlesByType(type: PromoBundleType) {
  return promoBundles.filter((bundle) => bundle.type === type);
}

function groupByMinSpend(bundles: ReturnType<typeof bundlesByType>) {
  return [...new Set(bundles.map((bundle) => bundle.minSpend))]
    .sort((a, b) => a - b)
    .map((minSpend) => ({
      minSpend,
      bundles: bundles.filter((bundle) => bundle.minSpend === minSpend),
    }));
}

export default function PromoPage() {
  return (
    <div className="bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-primary">
              Promo Hemat
            </p>
            <h1 className="text-2xl font-extrabold text-gray-900">Promo</h1>
          </div>
          <p className="max-w-xl text-sm text-muted-foreground">
            Pilih package dan tebus murah dengan hitungan hemat otomatis untuk
            belanja harian.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Kategori promo"
          className="mb-4 flex gap-2 overflow-x-auto"
        >
          {promoTabs.map((tab, index) => (
            <a
              key={tab}
              role="tab"
              aria-selected={index === 0}
              href={`#${tab.toLowerCase().replace(/\s+/g, "-")}`}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:border-primary hover:text-primary aria-selected:border-primary aria-selected:bg-primary aria-selected:text-white"
            >
              {tab}
            </a>
          ))}
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {promoFilterChips.map((filter) => (
            <span
              key={filter}
              className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm"
            >
              {filter}
            </span>
          ))}
        </div>

        <div className="space-y-10">
          {promoTabs.map((tab) => {
            const groups = groupByMinSpend(bundlesByType(tab));

            return (
              <section key={tab} id={tab.toLowerCase().replace(/\s+/g, "-")}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-gray-900">
                    {tab}
                  </h2>
                  <span className="text-xs font-medium text-muted-foreground">
                    {bundlesByType(tab).length} promo aktif
                  </span>
                </div>

                <div className="space-y-6">
                  {groups.map((group) => (
                    <div key={`${tab}-${group.minSpend}`}>
                      <div className="mb-3 flex items-center gap-2">
                        <div className="h-px flex-1 bg-gray-200" />
                        <h3 className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-800 shadow-sm">
                          Shopping Min. {formatRupiah(group.minSpend)}
                        </h3>
                        <div className="h-px flex-1 bg-gray-200" />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {group.bundles.map((bundle) => (
                          <BundlePackageCard
                            key={bundle.id}
                            bundle={bundle}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
