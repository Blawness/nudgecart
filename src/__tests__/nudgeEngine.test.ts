import { describe, it, expect } from "vitest";

const nudgeTemplates: Record<string, { headline: string; body: string; ctaText: string }> = {
  PRE_CHECKOUT_ECO: {
    headline: "Lengkapi dengan produk ramah lingkungan",
    body: "Tambahkan 1 produk ramah lingkungan untuk melengkapi belanjaanmu.",
    ctaText: "Lihat Produk",
  },
  PRE_CHECKOUT_ONGKIR: {
    headline: "Gratis Ongkir menantimu!",
    body: "Tambahkan Rp {amount} lagi untuk gratis ongkir.",
    ctaText: "Lanjut Belanja",
  },
  LAST_CHANCE_ECO_ALT: {
    headline: "Versi ramah lingkungan tersedia",
    body: "Versi ramah lingkungan tersedia untuk {product}.",
    ctaText: "Lihat Alternatif",
  },
  LAST_CHANCE_CARBON: {
    headline: "Kontribusi kamu",
    body: "Dengan belanja produk ini, kamu berkontribusi mengurangi {carbon} kg emisi karbon.",
    ctaText: "",
  },
  POST_PURCHASE_THANKS: {
    headline: "Terima kasih!",
    body: "Dengan memilih {product}, kamu telah berkontribusi untuk lingkungan yang lebih baik.",
    ctaText: "Lihat Rekomendasi",
  },
  POST_PURCHASE_COUNTER: {
    headline: "Pencapaian kamu!",
    body: "Ini pembelian ramah lingkungan ke-{count} kamu bulan ini!",
    ctaText: "",
  },
};

function determineFraming(context: string): "GAIN" | "LOSS" | null {
  if (context === "HOME" || context === "PRODUCT_DETAIL") return "GAIN";
  if (context === "CART" || context === "CHECKOUT") return "LOSS";
  if (context === "POST_PURCHASE") return "GAIN";
  return null;
}

describe("NudgeEngine — determineFraming", () => {
  it("returns GAIN for HOME context", () => {
    expect(determineFraming("HOME")).toBe("GAIN");
  });

  it("returns GAIN for PRODUCT_DETAIL context", () => {
    expect(determineFraming("PRODUCT_DETAIL")).toBe("GAIN");
  });

  it("returns LOSS for CART context", () => {
    expect(determineFraming("CART")).toBe("LOSS");
  });

  it("returns LOSS for CHECKOUT context", () => {
    expect(determineFraming("CHECKOUT")).toBe("LOSS");
  });

  it("returns GAIN for POST_PURCHASE context", () => {
    expect(determineFraming("POST_PURCHASE")).toBe("GAIN");
  });

  it("returns null for unknown context", () => {
    expect(determineFraming("UNKNOWN")).toBeNull();
  });
});

describe("NudgeEngine — Templates", () => {
  it("all templates have required fields", () => {
    for (const [key, template] of Object.entries(nudgeTemplates)) {
      expect(template.headline).toBeTruthy();
      expect(template.body).toBeTruthy();
      expect(template).toHaveProperty("ctaText");
    }
  });

  it("PRE_CHECKOUT_ECO template mentions eco-friendly", () => {
    expect(nudgeTemplates.PRE_CHECKOUT_ECO.headline.toLowerCase()).toContain("ramah lingkungan");
  });

  it("LAST_CHANCE_CARBON has placeholder for carbon value", () => {
    expect(nudgeTemplates.LAST_CHANCE_CARBON.body).toContain("{carbon}");
  });

  it("POST_PURCHASE_THANKS has placeholder for product name", () => {
    expect(nudgeTemplates.POST_PURCHASE_THANKS.body).toContain("{product}");
  });

  it("POST_PURCHASE_COUNTER has placeholder for count", () => {
    expect(nudgeTemplates.POST_PURCHASE_COUNTER.body).toContain("{count}");
  });

  it("CTAs are appropriate for each template", () => {
    expect(nudgeTemplates.PRE_CHECKOUT_ECO.ctaText).toBe("Lihat Produk");
    expect(nudgeTemplates.LAST_CHANCE_ECO_ALT.ctaText).toBe("Lihat Alternatif");
    expect(nudgeTemplates.POST_PURCHASE_THANKS.ctaText).toBe("Lihat Rekomendasi");
  });
});

describe("NudgeEngine — Template interpolation", () => {
  it("LAST_CHANCE_CARBON interpolates carbon value", () => {
    const result = nudgeTemplates.LAST_CHANCE_CARBON.body.replace("{carbon}", "0.5");
    expect(result).toContain("0.5");
    expect(result).toContain("kg emisi karbon");
  });

  it("POST_PURCHASE_THANKS interpolates product name", () => {
    const result = nudgeTemplates.POST_PURCHASE_THANKS.body.replace("{product}", "Susu Segar");
    expect(result).toContain("Susu Segar");
  });

  it("POST_PURCHASE_COUNTER interpolates count", () => {
    const result = nudgeTemplates.POST_PURCHASE_COUNTER.body.replace("{count}", "3");
    expect(result).toContain("3");
  });
});
