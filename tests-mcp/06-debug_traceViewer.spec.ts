import { expect, test } from "@playwright/test";

test("navigate and check pageTitle", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.getByTestId("home-card-forms").click();
  await page.getByTestId("full-name-input").click();
  await page.getByTestId("full-name-input").fill("testuser");
  await page.getByTestId("email-input").click();
  await page.getByTestId("email-input").fill("test@tester.com");
  await page.getByTestId("submit-button").click();
  await expect(page.getByTestId("form-success-message")).toBeVisible();
});
