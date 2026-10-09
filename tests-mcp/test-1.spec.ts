import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.getByTestId("home-card-forms").click();
  await page.getByTestId("full-name-input").click();
  await page.getByTestId("full-name-input").fill("testuser");
  await page.getByTestId("email-input").click();
  await page.getByTestId("email-input").fill("tes@tester.com");
  await page.getByTestId("email-input").press("Tab");
  await page.getByTestId("password-input").fill("12345678");
  await page.getByTestId("message-textarea").click();
  await page.getByTestId("message-textarea").fill("hello world");
  await page.getByTestId("contact-email-checkbox").check();
  await page.getByTestId("urgency-medium-radio").check();
  await page.getByTestId("topic-select").selectOption("technical");
  await page.getByTestId("submit-button").click();
  await expect(page.getByTestId("form-success-message")).toBeVisible();
});
