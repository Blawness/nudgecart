"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NudgeInlineBannerProps {
  headline: string;
  body: string;
  ctaText: string;
  onAccept: () => void;
  onDismiss: () => void;
}

export function NudgeInlineBanner({
  headline,
  body,
  ctaText,
  onAccept,
  onDismiss,
}: NudgeInlineBannerProps) {
  const isEco = body.toLowerCase().includes("ramah lingkungan");

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg border mb-4",
        isEco ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"
      )}
    >
      <span className="text-lg shrink-0">{isEco ? "🌿" : "💡"}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{headline}</p>
        <p className="text-xs text-muted-foreground">{body}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button variant="outline" size="xs" onClick={onAccept}>
          {ctaText}
        </Button>
        <Button variant="ghost" size="icon-xs" onClick={onDismiss}>
          <X className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
