import { describe, it, expect, beforeEach } from "vitest";
import { useNudgeStore } from "@/stores/nudgeStore";

function getStore() {
  return useNudgeStore.getState();
}

describe("useNudgeStore", () => {
  beforeEach(() => {
    useNudgeStore.setState({
      popupShownThisSession: false,
      nudgeInteractionCount: 0,
    });
  });

  it("initializes with popup not shown and 0 interactions", () => {
    const state = getStore();
    expect(state.popupShownThisSession).toBe(false);
    expect(state.nudgeInteractionCount).toBe(0);
  });

  it("has a valid sessionId UUID", () => {
    const state = getStore();
    expect(state.sessionId).toBeTruthy();
    expect(state.sessionId.length).toBeGreaterThan(10);
  });

  it("setPopupShown marks popup as shown", () => {
    getStore().setPopupShown();
    expect(getStore().popupShownThisSession).toBe(true);
  });

  it("incrementInteraction increases count", () => {
    getStore().incrementInteraction();
    expect(getStore().nudgeInteractionCount).toBe(1);

    getStore().incrementInteraction();
    getStore().incrementInteraction();
    expect(getStore().nudgeInteractionCount).toBe(3);
  });

  it("setPopupShown does not affect interaction count", () => {
    getStore().incrementInteraction();
    getStore().incrementInteraction();
    getStore().setPopupShown();
    expect(getStore().nudgeInteractionCount).toBe(2);
    expect(getStore().popupShownThisSession).toBe(true);
  });

  it("resetSession resets all state and generates new sessionId", () => {
    const originalSessionId = getStore().sessionId;

    getStore().setPopupShown();
    getStore().incrementInteraction();
    getStore().incrementInteraction();
    getStore().incrementInteraction();

    getStore().resetSession();

    const state = getStore();
    expect(state.popupShownThisSession).toBe(false);
    expect(state.nudgeInteractionCount).toBe(0);
    expect(state.sessionId).not.toBe(originalSessionId);
  });
});
