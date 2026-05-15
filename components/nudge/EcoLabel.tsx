"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface EcoLabelProps {
  label: "FRESH" | "ECONOMICAL" | "POPULAR";
  tooltip?: string | null;
}

const configs = {
  FRESH: { icon: "🌿", text: "Produk Segar", color: "bg-green-100 text-green-800 border-green-200" },
  ECONOMICAL: { icon: "💚", text: "Pilihan Hemat &amp; Fresh", color: "bg-green-100 text-green-800 border-green-200" },
  POPULAR: { icon: "🏆", text: "Pilihan Terpopuler", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
};

export function EcoLabel({ label, tooltip }: EcoLabelProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const config = configs[label];

  if (!config) return null;

  return (
    <div className="relative inline-flex items-center">
      <span
        className={cn(
          "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border",
          config.color
        )}
        onClick={() => setShowTooltip(!showTooltip)}
      >
        {config.icon} {config.text}
        {tooltip && <Info className="size-2.5 cursor-pointer" />}
      </span>
      {showTooltip && tooltip && (
        <div className="absolute top-full mt-1 left-0 z-10 bg-white border rounded-lg shadow-lg p-2 text-xs text-muted-foreground max-w-[200px] animate-in fade-in duration-200">
          {tooltip}
          <button
            onClick={() => setShowTooltip(false)}
            className="block mt-1 text-xs text-primary hover:underline"
          >
            Tutup
          </button>
        </div>
      )}
    </div>
  );
}
