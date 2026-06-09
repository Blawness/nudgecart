import { Star, Users } from "lucide-react";

interface SocialNormBadgeProps {
  type: "WEEKLY_BUYERS" | "LOCAL_BUYERS";
}

const variants = {
  WEEKLY_BUYERS: {
    icon: Star,
    text: "Dipilih oleh 1.240 pengguna minggu ini.",
  },
  LOCAL_BUYERS: {
    icon: Users,
    text: "87 orang di sekitarmu membeli produk ini bulan lalu.",
  },
};

export function SocialNormBadge({ type }: SocialNormBadgeProps) {
  const variant = variants[type];

  if (!variant) return null;

  const Icon = variant.icon;

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1" data-testid="social-norm-badge">
      <Icon className="size-3.5 shrink-0" />
      <span>{variant.text}</span>
    </div>
  );
}
