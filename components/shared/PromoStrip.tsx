"use client";

import { useState } from "react";
import { X, Percent } from "lucide-react";

export function PromoStrip() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-30 sm:hidden">
      <div className="flex items-center gap-2.5 bg-primary px-3 py-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-yellow-400">
          <Percent className="size-4 text-yellow-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-yellow-400 leading-tight">
            Diskon 15% hingga 75RB
          </p>
          <p className="text-xs text-white/80 leading-tight">
            Belanja{" "}
            <span className="font-semibold text-white">99RB</span> untuk{" "}
            <span className="cursor-pointer font-semibold text-yellow-300 underline underline-offset-1">
              klaim vouchernya
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-full p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Tutup promo"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
