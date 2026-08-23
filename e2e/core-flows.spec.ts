import { test, expect } from "@playwright/test";

const restaurantSlug = process.env.E2E_RESTAURANT_SLUG ?? "nssercafa";
const runMutations = process.env.E2E_MUTATIONS === "1";

test.describe("NFOOD core journeys", () => {
  test("loads the public menu in English by default and exposes language choices", async ({ page }) => {
    await page.goto(`/restaurant/${restaurantSlug}`);
    await expect(page.locator("body")).toHaveAttribute("dir", "ltr");
    await expect(page.locator('summary[aria-label*="language"], summary[aria-label*="Language"], summary[aria-label*="اللغة"]').first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /menu|قائمة الطعام/i }).first()).toBeVisible();
  });

  test("logs in through the unified test account form", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-email").fill("nfood@ret.com");
    await page.getByTestId("login-password").fill("123456");
    await expect(page.getByTestId("login-email")).toHaveValue("nfood@ret.com");
    await expect(page.getByTestId("login-password")).toHaveValue("123456");
    await expect(page.getByTestId("login-submit")).toBeEnabled();
    await page.getByTestId("login-submit").click();
    await expect(page.getByRole("heading", { name: /overview|نظرة عامة|dashboard|لوحة التحكم/i }).first()).toBeVisible();
    await expect(page.getByText("Operations", { exact: true }).first()).toBeVisible();
    await expect(page.locator("body")).not.toContainText("الإعدادات والتكاملات");
    await expect(page.getByTestId("login-email")).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText("تعذر حفظ جلسة Admin الحالية");

    // Regression guard: the session must survive the reload triggered by a real browser visit.
    await page.reload();
    await expect(page.getByRole("heading", { name: /overview|نظرة عامة|dashboard|لوحة التحكم/i }).first()).toBeVisible();
    await expect(page.getByTestId("login-email")).toHaveCount(0);
  });

  test("supports switching the public menu to French with RTL/LTR update", async ({ page }) => {
    await page.goto(`/restaurant/${restaurantSlug}`);
    const languageButton = page.locator('summary[aria-label*="language"], summary[aria-label*="Language"], summary[aria-label*="اللغة"]').first();
    await languageButton.click();
    await page.getByRole("menuitem").filter({ hasText: /Français|French|الفرنسية/i }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(page.locator("body")).toHaveAttribute("dir", "ltr");
  });

  test("opens checkout and shows order-specific requirements before submission", async ({ page }) => {
    test.skip(!runMutations, "Set E2E_MUTATIONS=1 to run write-flow E2E against a disposable database.");
    await page.goto(`/restaurant/${restaurantSlug}`);
    const addButton = page.getByRole("button", { name: /add|إضافة|plus/i }).first();
    await expect(addButton).toBeVisible();
    await addButton.click();
    await page.getByRole("button", { name: /cart|السلة/i }).first().click();
    await expect(page.getByText(/checkout|إتمام|بيانات الطلب/i).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /confirm|تأكيد الطلب/i }).first()).toBeDisabled();
  });

  test("opens reservation form and requires the guest details", async ({ page }) => {
    test.skip(!runMutations, "Set E2E_MUTATIONS=1 to run write-flow E2E against a disposable database.");
    await page.goto(`/restaurant/${restaurantSlug}`);
    await page.getByRole("button", { name: /reservation|الحجز/i }).first().click();
    await expect(page.getByRole("heading", { name: /reservation|حجز/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /request|إرسال|طلب الحجز/i }).first()).toBeDisabled();
  });
});
