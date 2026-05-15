"use client";

import { create } from "zustand";

let sessionId = "";
if (typeof window !== "undefined") {
  const stored = sessionStorage.getItem("nudgeSessionId");
  if (stored) {
    sessionId = stored;
  } else {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("nudgeSessionId", sessionId);
  }
}

interface NudgeStore {
  sessionId: string;
  popupShownThisSession: boolean;
  nudgeInteractionCount: number;
  setPopupShown: () => void;
  incrementInteraction: () => void;
  resetSession: () => void;
}

export const useNudgeStore = create<NudgeStore>((set) => ({
  sessionId,
  popupShownThisSession: false,
  nudgeInteractionCount: 0,
  setPopupShown: () => set({ popupShownThisSession: true }),
  incrementInteraction: () =>
    set((state) => ({ nudgeInteractionCount: state.nudgeInteractionCount + 1 })),
  resetSession: () => {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("nudgeSessionId", sessionId);
    set({
      sessionId,
      popupShownThisSession: false,
      nudgeInteractionCount: 0,
    });
  },
}));
