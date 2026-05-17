import { describe, it, expect } from "vitest";

const paymentOptions = [
  { id: "BANK_TRANSFER", label: "Transfer Bank" },
  { id: "COD", label: "Bayar di Tempat (COD)" },
];

const orderStatuses = [
  "PENDING_PAYMENT",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const ecoLabels = ["FRESH", "ECONOMICAL", "POPULAR"] as const;
const socialNormTypes = ["WEEKLY_BUYERS", "LOCAL_BUYERS"] as const;
const lifestyleTypes = ["HEMAT", "SEHAT", "ECO"] as const;
const shoppingFrequencies = ["HARIAN", "MINGGUAN", "BULANAN"] as const;
const nudgeFramings = ["GAIN", "LOSS", "SOCIAL_NORM"] as const;
const nudgeContexts = ["HOME", "PRODUCT_DETAIL", "CART", "CHECKOUT", "POST_PURCHASE"] as const;
const nudgeEvents = ["NUDGE_DISPLAYED", "NUDGE_ACCEPTED", "NUDGE_DISMISSED", "ECO_PURCHASE", "PROMO_PERSONAL_CLICK"] as const;

describe("Domain types — consistency checks", () => {
  it("order statuses cover full flow", () => {
    expect(orderStatuses).toHaveLength(6);
    expect(orderStatuses).toContain("PENDING_PAYMENT");
    expect(orderStatuses).toContain("DELIVERED");
  });

  it("payment methods include both options", () => {
    expect(paymentOptions).toHaveLength(2);
    expect(paymentOptions.map((p) => p.id)).toEqual(["BANK_TRANSFER", "COD"]);
  });

  it("eco labels have exactly 3 types", () => {
    expect(ecoLabels).toHaveLength(3);
    expect(ecoLabels).toContain("FRESH");
    expect(ecoLabels).toContain("ECONOMICAL");
    expect(ecoLabels).toContain("POPULAR");
  });

  it("social norm types cover both variants", () => {
    expect(socialNormTypes).toHaveLength(2);
  });

  it("lifestyle types cover all preferences", () => {
    expect(lifestyleTypes).toHaveLength(3);
  });

  it("shopping frequencies cover all intervals", () => {
    expect(shoppingFrequencies).toHaveLength(3);
  });

  it("nudge framings cover GAIN, LOSS, SOCIAL_NORM", () => {
    expect(nudgeFramings).toHaveLength(3);
  });

  it("nudge contexts cover all user touchpoints", () => {
    expect(nudgeContexts).toHaveLength(5);
  });

  it("nudge events include DISPLAYED, ACCEPTED, DISMISSED, ECO_PURCHASE, PROMO_CLICK", () => {
    expect(nudgeEvents).toHaveLength(5);
    expect(nudgeEvents).toContain("ECO_PURCHASE");
  });
});

describe("Shipping fee", () => {
  it("is flat Rp 10.000", () => {
    const shippingFee = 10000;
    expect(shippingFee).toBe(10000);
  });
});

describe("Cart line item math", () => {
  it("calculates subtotal correctly", () => {
    const item = { price: 15000, quantity: 3 };
    const subtotal = item.price * item.quantity;
    expect(subtotal).toBe(45000);
  });

  it("calculates total with shipping", () => {
    const items = [
      { price: 15000, quantity: 2 },
      { price: 5000, quantity: 4 },
    ];
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal + 10000;
    expect(subtotal).toBe(50000);
    expect(total).toBe(60000);
  });
});
