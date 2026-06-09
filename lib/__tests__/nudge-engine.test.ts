import { describe, it, expect } from "vitest";
import { determineFraming, nudgeTemplates } from "../nudge-engine";
import type { NudgeContext } from "@/types";

describe("determineFraming", () => {
  it('returns GAIN for HOME context', () => {
    expect(determineFraming("HOME")).toBe("GAIN");
  });

  it('returns GAIN for PRODUCT_DETAIL context', () => {
    expect(determineFraming("PRODUCT_DETAIL")).toBe("GAIN");
  });

  it('returns LOSS for CART context', () => {
    expect(determineFraming("CART")).toBe("LOSS");
  });

  it('returns LOSS for CHECKOUT context', () => {
    expect(determineFraming("CHECKOUT")).toBe("LOSS");
  });

  it('returns GAIN for POST_PURCHASE context', () => {
    expect(determineFraming("POST_PURCHASE")).toBe("GAIN");
  });

  it("returns null for unknown context", () => {
    expect(determineFraming("UNKNOWN" as NudgeContext)).toBeNull();
  });
});

describe("nudgeTemplates", () => {
  const requiredKeys = [
    "PRE_CHECKOUT_ECO",
    "PRE_CHECKOUT_ONGKIR",
    "LAST_CHANCE_ECO_ALT",
    "LAST_CHANCE_CARBON",
    "POST_PURCHASE_THANKS",
    "POST_PURCHASE_COUNTER",
  ] as const;

  it("has all required template keys", () => {
    for (const key of requiredKeys) {
      expect(nudgeTemplates[key]).toBeDefined();
    }
  });

  it("all templates have headline and body", () => {
    for (const key of requiredKeys) {
      expect(nudgeTemplates[key].headline).toBeTruthy();
      expect(nudgeTemplates[key].body).toBeTruthy();
    }
  });

  it("all templates have ctaText (may be empty string)", () => {
    for (const key of requiredKeys) {
      expect(nudgeTemplates[key].ctaText).toBeDefined();
    }
  });
});
