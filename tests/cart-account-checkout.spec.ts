import { expect, test } from "@playwright/test";

async function registerAndLogin(page: import("@playwright/test").Page) {
  const email = `buyer-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`;
  const password = "password123";

  const registerRes = await page.request.post("/api/auth/register", {
    data: {
      name: "Buyer Test",
      email,
      phone: "081200000001",
      password,
    },
  });
  expect(registerRes.ok()).toBeTruthy();

  await page.goto("/login");
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole("button", { name: /Masuk/i }).click();
  await page.waitForURL(/^(?!.*\/login).*/);

  return { email };
}

test.describe("cart, checkout, and account slice", () => {
  test("guest is redirected from account to login", async ({ page }) => {
    await page.goto("/account");
    await expect(page).toHaveURL(/\/login/);
  });

  test("authenticated buyer sees account summary and menu labels", async ({ page }) => {
    await page.goto("/login");
    await page.locator('input[type="email"]').fill("buyer@pasarku.id");
    await page.locator('input[type="password"]').fill("password123");
    await page.getByRole("button", { name: /Masuk/i }).click();
    await page.waitForURL(/^(?!.*\/login).*/);

    await page.goto("/account");

    await expect(page.getByRole("heading", { name: "Akun Saya" })).toBeVisible();
    await expect(page.getByText("NEWBIE")).toBeVisible();
    await expect(page.getByText(/Member since/i)).toBeVisible();
    await expect(page.getByText(/Kamu sudah hemat Rp/)).toBeVisible();

    for (const label of [
      "Account Settings",
      "Ratings & Reviews",
      "Application Permissions",
      "Help Center",
    ]) {
      await expect(page.getByText(label)).toBeVisible();
    }
  });

  test("cart default promo is checked and updates total when toggled", async ({ page }) => {
    await registerAndLogin(page);

    const productsRes = await page.request.get("/api/products?limit=50");
    expect(productsRes.ok()).toBeTruthy();
    const productsBody = await productsRes.json();
    const product = productsBody.data.find(
      (item: { id: string; price: number; stock: number }) =>
        item.stock >= Math.ceil(50000 / item.price)
    );
    expect(product, "Expected at least one product with enough stock").toBeTruthy();

    const quantity = Math.ceil(50000 / product.price);
    const addRes = await page.request.post("/api/cart/items", {
      data: { productId: product.id, quantity },
    });
    expect(addRes.ok()).toBeTruthy();

    await page.goto("/cart");

    const promo = page.getByRole("checkbox", { name: /Gratis Ongkir/i });
    await expect(promo).toBeChecked();
    await expect(page.getByText("Diskon Promo")).toBeVisible();
    await expect(page.getByText("-Rp 10.000")).toBeVisible();

    const totalBefore = await page.getByTestId("cart-summary-total").textContent();
    await promo.uncheck();
    await expect(page.getByText("-Rp 10.000")).toHaveCount(0);
    const totalAfter = await page.getByTestId("cart-summary-total").textContent();

    expect(totalAfter).not.toEqual(totalBefore);
  });
});
