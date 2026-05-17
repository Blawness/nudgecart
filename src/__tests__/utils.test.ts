import { describe, it, expect } from "vitest";
import { formatRupiah, slugify, cn } from "@/lib/utils";

describe("formatRupiah", () => {
  it("formats zero", () => {
    const result = formatRupiah(0);
    expect(result).toContain("0");
  });

  it("formats thousands", () => {
    const result = formatRupiah(15000);
    expect(result).toContain("15.000");
  });

  it("formats millions", () => {
    const result = formatRupiah(1250000);
    expect(result).toContain("1.250.000");
  });

  it("includes Rp prefix", () => {
    const result = formatRupiah(10000);
    expect(result).toContain("Rp");
  });

  it("does not include decimal places", () => {
    const result = formatRupiah(10000);
    expect(result).not.toContain(",");
  });
});

describe("slugify", () => {
  it("converts to lowercase", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("replaces spaces with hyphens", () => {
    expect(slugify("produk segar dan sehat")).toBe("produk-segar-dan-sehat");
  });

  it("removes special characters", () => {
    expect(slugify("Harga: Rp 10.000!")).toBe("harga-rp-10000");
  });

  it("handles multiple spaces", () => {
    expect(slugify("a  b   c")).toBe("a-b-c");
  });

  it("strips leading/trailing spaces and hyphens", () => {
    const result = slugify("  hello  ");
    expect(result).not.toContain("  ");
  });
});

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("filters falsy values", () => {
    expect(cn("a", false && "b", "c", undefined, "d")).toBe("a c d");
  });

  it("handles conditional classes", () => {
    expect(cn("base", true && "active", false && "inactive")).toBe("base active");
  });
});
