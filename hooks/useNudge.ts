"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useNudgeStore } from "@/stores/nudgeStore";
import type { NudgeDecision, NudgeContext, NudgeLog } from "@/types";

export function useNudge() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { sessionId, popupShownThisSession, nudgeInteractionCount, setPopupShown, incrementInteraction } =
    useNudgeStore();

  const evaluateNudge = useMutation({
    mutationFn: async (params: {
      context: NudgeContext;
      productId?: string;
    }): Promise<NudgeDecision> => {
      if (!userId) return { shouldShow: false, nudgeType: null, framingType: null, content: null };

      const res = await fetch("/api/nudge/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          context: params.context,
          productId: params.productId,
          popupAlreadyShown: popupShownThisSession,
        }),
      });

      if (!res.ok) return { shouldShow: false, nudgeType: null, framingType: null, content: null };
      const json = await res.json();
      return json.data;
    },
  });

  const logEvent = useMutation({
    mutationFn: async (params: {
      nudgeType: string;
      framingType: string | null;
      nudgeContext: NudgeContext;
      event: string;
      productId?: string;
      alternativeProductId?: string;
    }) => {
      if (!userId) return;

      await fetch("/api/nudge/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          ...params,
        }),
      });
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: async (rating: number) => {
      if (!userId) return;

      await fetch("/api/nudge/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, rating }),
      });
    },
  });

  return {
    evaluateNudge,
    logEvent,
    feedbackMutation,
    sessionId,
    popupShownThisSession,
    nudgeInteractionCount,
    setPopupShown,
    incrementInteraction,
    userId,
  };
}

export function useNudgeHistory() {
  const { data, isLoading } = useQuery({
    queryKey: ["nudge-history"],
    queryFn: async () => {
      const res = await fetch("/api/nudge/log");
      if (!res.ok) throw new Error("Gagal memuat nudge history");
      const json = await res.json();
      return json.data as NudgeLog[];
    },
  });

  return { history: data ?? [], isLoading };
}
