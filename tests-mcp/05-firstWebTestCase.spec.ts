import { expect, test } from "@playwright/test";

test("navigate and check pageTitle", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  //   await page.locator(".form");
  await expect(page).toHaveTitle(/HourToLearn/);
});
