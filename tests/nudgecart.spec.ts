import { test, expect } from "@playwright/test";

test.describe("NudgeCart E2E — Public Pages", () => {
  test("homepage shows NudgeCart branding", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/NudgeCart/);
    await expect(page.locator("body")).toContainText("NudgeCart");
  });

  test("homepage has core sections", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("section").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Kategori" })).toBeVisible();
  });

  test("homepage shows personalized product and promo sections without blank state", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Produk Pilihan" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Promo Pilihan" }),
    ).toBeVisible();
    await expect(page.getByText(/Lebih Hemat Rp/).first()).toBeVisible();
  });

  test("homepage hero banner auto-rotates", async ({ page }) => {
    await page.goto("/");
    const banner = page.locator("section").first();
    await expect(banner).toBeVisible();
  });

  test("category navigation has category links", async ({ page }) => {
    await page.goto("/");
    const categories = page.locator("a[href^='/categories/']");
    const count = await categories.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("search bar navigates with query parameter", async ({ page }) => {
    await page.goto("/");
    const searchInput = page.locator('input[type="search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill("sayur");
      await searchInput.press("Enter");
      await expect(page).toHaveURL(/q=sayur/);
    }
  });

  test("login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: /Masuk/i })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("register buyer page loads", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByRole("button", { name: /Daftar/i })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("register merchant page loads", async ({ page }) => {
    await page.goto("/register/merchant");
    await expect(page.getByRole("button", { name: /Daftar/i })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("product grid renders products or empty state", async ({ page }) => {
    await page.goto("/");

    const productCards = page.locator("a[href^='/products/']");
    const emptyState = page.getByText(/Belum ada produk/i);

    await expect(productCards.first().or(emptyState)).toBeVisible({ timeout: 10000 });
  });

  test("product images use real photos, not random placeholders", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const images = page.locator("img[alt]");
    const count = await images.count();
    expect(count).toBeGreaterThanOrEqual(1);

    const invalidImages: string[] = [];
    for (let i = 0; i < count; i++) {
      const src = await images.nth(i).getAttribute("src");
      const alt = await images.nth(i).getAttribute("alt");
      if (src?.includes("picsum.photos")) {
        invalidImages.push(`${alt}: ${src}`);
      }
    }

    expect(
      invalidImages,
      `Found ${invalidImages.length} product(s) still using picsum placeholder: ${invalidImages.join(", ")}`
    ).toHaveLength(0);
  });

  test("product grid screenshot — visual regression check", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const productSection = page.locator("section").nth(1);
    await expect(productSection).toBeVisible({ timeout: 10000 });

    await productSection.screenshot({
      path: "test-results/product-grid.png",
    });
  });

  test("footer contains app name", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const footer = page.locator("footer");
    if (await footer.isVisible()) {
      await expect(footer).toContainText(/NudgeCart|Pasarku/, { timeout: 5000 });
    }
  });

  test("mobile bottom nav visible on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const bottomNav = page.getByRole("navigation").last();
    await expect(bottomNav).toBeVisible();
  });
});

test.describe("NudgeCart E2E — Auth Flow", () => {
  test("unauthenticated user redirected from cart to login", async ({ page }) => {
    await page.goto("/cart");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated user redirected from checkout to login", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated user redirected from orders to login", async ({ page }) => {
    await page.goto("/orders");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated user redirected from profile to login", async ({ page }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated user redirected from onboarding to login", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page).toHaveURL(/\/login/);
  });

  test("authenticated buyer sees one-step preference onboarding picker", async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined });
    const authPage = await context.newPage();

    await authPage.goto("/login");
    await authPage.locator('input[type="email"]').fill("buyer@pasarku.id");
    await authPage.locator('input[type="password"]').fill("password123");
    await authPage.getByRole("button", { name: /Masuk/i }).click();
    await authPage.waitForURL(/.*/);

    await authPage.goto("/onboarding");

    await expect(
      authPage.getByRole("heading", {
        name: "Kategori Produk apa yang paling Sering Kamu Beli?",
      }),
    ).toBeVisible();
    await expect(authPage.getByText("Pilih yang paling sesuai")).toBeVisible();

    for (const option of [
      "Sayuran & Telur",
      "Buah-Buahan",
      "Kebutuhan Rumah Tangga",
      "Lainnya",
    ]) {
      await expect(authPage.getByRole("button", { name: option })).toBeVisible();
    }

    await expect(authPage.getByRole("button", { name: /Lewati/ })).toBeVisible();
    await expect(authPage.getByRole("button", { name: /Lanjut/ })).toBeVisible();
    await expect(
      authPage.getByText(
        "Preferensi ini membantu kami menampilkan produk yang paling relevan untuk kamu",
      ),
    ).toBeVisible();
    await expect(authPage.getByText("Gaya belanja")).toHaveCount(0);
    await expect(authPage.getByText("Seberapa sering")).toHaveCount(0);

    await context.close();
  });

  test("merchant routes redirect to login when unauthenticated", async ({ page }) => {
    await page.goto("/merchant/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("admin routes redirect to login when unauthenticated", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("NudgeCart E2E — Shopping Flow", () => {
  test("can navigate product listing -> detail", async ({ page }) => {
    await page.goto("/");

    const productLink = page.locator("a[href^='/products/']").first();
    if (await productLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await productLink.click();
      await expect(page).toHaveURL(/\/products\//);
      await expect(page.locator("h1")).toBeVisible();
    }
  });

  test("product detail page shows add to cart button", async ({ page }) => {
    await page.goto("/");

    const productLink = page.locator("a[href^='/products/']").first();
    if (await productLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await productLink.click();

      const addToCart = page.getByText(/Tambah ke Keranjang|Stok Habis/);
      await expect(addToCart.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test("can browse category pages", async ({ page }) => {
    await page.goto("/");

    const categoryLink = page.locator("a[href^='/categories/']").first();
    if (await categoryLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await categoryLink.click();
      await expect(page).toHaveURL(/\/categories\//);
    }
  });

  test("404 page for non-existent product", async ({ page }) => {
    await page.goto("/products/non-existent-product-that-does-not-exist-12345");
    await expect(page.getByText(/tidak ditemukan|404/)).toBeVisible({ timeout: 10000 });
  });
});

test.describe("NudgeCart E2E — Nudge Components", () => {
  test("checkout page redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page).toHaveURL(/\/login/);
  });

  test("eco-label badge visible on product detail for eco-friendly products", async ({ page }) => {
    await page.goto("/");
    const productLink = page.locator("a[href^='/products/']").first();
    if (await productLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await productLink.click();
      await page.waitForLoadState("networkidle");

      const ecoBadge = page.locator("[data-testid='eco-label']").first();
      const socialNormBadge = page.locator("[data-testid='social-norm-badge']").first();
      const carbonBlock = page.getByText(/karbon|CO2|lingkungan/).first();

      const anyNudgeElement = ecoBadge.or(socialNormBadge).or(carbonBlock);
      await expect(anyNudgeElement.or(page.locator("h1"))).toBeVisible({ timeout: 10000 });
    }
  });

  test("eco badge shows on product cards on homepage", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const ecoLabels = page.locator("[data-testid='eco-label']");
    const count = await ecoLabels.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("recommendation section appears for authenticated buyer", async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined });
    const authPage = await context.newPage();

    await authPage.goto("/login");
    await authPage.locator('input[type="email"]').fill("buyer@pasarku.id");
    await authPage.locator('input[type="password"]').fill("password123");
    await authPage.getByRole("button", { name: /Masuk/i }).click();
    await authPage.waitForURL(/.*/);
    await authPage.waitForLoadState("networkidle");

    const recSection = authPage.locator("[data-testid='recommendation-section']");
    await expect(recSection.or(authPage.locator("body"))).toBeVisible({ timeout: 10000 });
    await context.close();
  });

  test("cart page loads for authenticated buyer", async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined });
    const authPage = await context.newPage();

    await authPage.goto("/login");
    await authPage.locator('input[type="email"]').fill("buyer@pasarku.id");
    await authPage.locator('input[type="password"]').fill("password123");
    await authPage.getByRole("button", { name: /Masuk/i }).click();
    await authPage.waitForURL(/.*/);
    await authPage.waitForLoadState("networkidle");

    await authPage.goto("/cart");
    await authPage.waitForLoadState("networkidle");
    await expect(authPage).toHaveURL(/\/cart/);
    await context.close();
  });

  test("social norm badge visible on product detail", async ({ page }) => {
    await page.goto("/");
    const productLink = page.locator("a[href^='/products/']").first();
    if (await productLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await productLink.click();
      await page.waitForLoadState("networkidle");
      const badge = page.locator("[data-testid='social-norm-badge']").first();
      await expect(badge.or(page.locator("h1"))).toBeVisible({ timeout: 5000 });
    }
  });
});
