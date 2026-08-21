import { test, expect } from "@playwright/test";

test.describe.serial("Authentication Flows", () => {
  const timestamp = Date.now();
  const testUser = {
    name: `E2E User ${timestamp}`,
    email: `e2e-${timestamp}@example.com`,
    password: "Password123!",
  };

  test("User can register a new account", async ({ page }) => {
    // Navigate to registration page
    await page.goto("/register");
    await page.waitForFunction(
      () => (window as any).useNuxtApp?.().isHydrating === false,
    );

    // Fill in the form
    await page.fill("#email", testUser.email);
    await page.fill("#name", testUser.name);
    await page.fill("#password", testUser.password);

    // Submit the form
    await page.click('button[type="submit"]');

    // Assert redirection to dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Assert dashboard contains some expected text if needed,
    // or just checking URL is sufficient for basic nav.
    await expect(page.locator("h1").or(page.locator("h2"))).toBeVisible();
  });

  test("User can login with existing account", async ({ page }) => {
    // Navigate to login page
    await page.goto("/login");
    await page.waitForFunction(
      () => (window as any).useNuxtApp?.().isHydrating === false,
    );

    // Fill in the form
    await page.fill("#email", testUser.email);
    await page.fill("#password", testUser.password);

    // Submit the form
    await page.click('button[type="submit"]');

    // Assert redirection to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("User sees error with invalid credentials", async ({ page }) => {
    // Navigate to login page
    await page.goto("/login");
    await page.waitForFunction(
      () => (window as any).useNuxtApp?.().isHydrating === false,
    );

    // Fill in the form with bad password
    await page.fill("#email", testUser.email);
    await page.fill("#password", "WrongPassword123!");

    // Submit the form
    await page.click('button[type="submit"]');

    // Assert error message appears (from the error block in login.vue)
    // The error div has class "bg-red-50 text-red-600"
    const errorLocator = page.locator(".text-red-600");
    await expect(errorLocator).toBeVisible();
    await expect(errorLocator).toContainText("Invalid credentials");
  });
});
