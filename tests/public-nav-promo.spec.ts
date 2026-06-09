import { expect, test } from "@playwright/test";

test.describe("public navigation and promo page", () => {
  test("promo page shows baseline promo sections and filters", async ({
    page,
  }) => {
    await page.goto("/promo");

    await expect(
      page.getByRole("heading", { name: "Promo" }),
    ).toBeVisible();
    await expect(page.getByRole("tab", { name: "Package" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Tebus Murah" })).toBeVisible();

    for (const filter of [
      "Promo",
      "Product Online",
      "Delivery",
      "Product Category",
    ]) {
      await expect(page.getByText(filter, { exact: true })).toBeVisible();
    }

    await expect(page.getByText(/Shopping Min\. Rp/).first()).toBeVisible();
    await expect(page.getByText("+ Basket").first()).toBeVisible();
  });

  test("mobile bottom nav includes Promo and no Brand item", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    const bottomNav = page.getByRole("navigation").last();
    await expect(bottomNav).toBeVisible();
    await expect(bottomNav.getByRole("link", { name: /Promo/i })).toHaveAttribute(
      "href",
      "/promo",
    );
    await expect(bottomNav.getByText("Chat CS")).toHaveCount(0);
    await expect(bottomNav.getByText("Brand")).toHaveCount(0);
  });

  test("desktop nav does not show a Brand menu item", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");

    const headerNav = page.getByRole("navigation").first();
    await expect(headerNav.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(headerNav.getByRole("link", { name: "Kategori" })).toBeVisible();
    await expect(headerNav.getByRole("link", { name: "Promo" })).toBeVisible();
    await expect(headerNav.getByText("Brand")).toHaveCount(0);
  });
});
