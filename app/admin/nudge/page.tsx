"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart3, Eye, Check, X, Leaf } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApiSuccess } from "@/types";

interface NudgeAnalytics {
  totalDisplayed: number;
  totalAccepted: number;
  totalDismissed: number;
  acceptanceRate: number;
  byType: Array<{
    nudgeType: string;
    displayed: number;
    accepted: number;
    rate: number;
  }>;
  ecoPurchaseCount: number;
}

const nudgeTypeLabels: Record<string, string> = {
  JUST_IN_TIME: "Just-in-Time",
  PRE_CHECKOUT: "Pre-Checkout",
  LAST_CHANCE: "Last-Chance",
  POST_PURCHASE: "Post-Purchase",
  PROMO_PERSONAL: "Promo Personal",
  RECOMMENDATION: "Rekomendasi",
};

export default function AdminNudgePage() {
  const { data, isLoading } = useQuery<ApiSuccess<NudgeAnalytics>>({
    queryKey: ["nudge-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/admin/nudge/analytics");
      if (!res.ok) throw new Error("Gagal memuat data analytics");
      return res.json();
    },
  });

  const analytics = data?.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">NudgeCart Analytics</h1>
        <p className="text-muted-foreground text-sm">
          Monitor performa dan acceptance rate sistem nudge
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : analytics ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Eye className="size-4" />
                  Total Ditampilkan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{analytics.totalDisplayed}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Check className="size-4 text-green-600" />
                  Total Diterima
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{analytics.totalAccepted}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <BarChart3 className="size-4" />
                  Acceptance Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {(analytics.acceptanceRate * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Leaf className="size-4 text-green-600" />
                  Eco Purchases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{analytics.ecoPurchaseCount}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performa per Jenis Nudge</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.byType.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada data nudge.</p>
              ) : (
                <div className="space-y-3">
                  {analytics.byType.map((item) => (
                    <div
                      key={item.nudgeType}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {nudgeTypeLabels[item.nudgeType] ?? item.nudgeType}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ditampilkan: {item.displayed} · Diterima: {item.accepted}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold">
                          {(item.rate * 100).toFixed(1)}%
                        </span>
                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${item.rate * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Data `NudgeLog` tersedia melalui API. Gunakan endpoint
                `/api/nudge/log` untuk mengunduh data mentah untuk analisis
                penelitian.
              </p>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Gagal memuat data analytics.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
