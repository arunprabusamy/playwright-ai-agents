import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000/forms");
});

test("submit support request form with valid data - happy flow", async ({ page }) => {
  await page.getByTestId("full-name-input").fill("John Doe");
  await page.getByTestId("email-input").fill("john.doe@hourtolearn.dev");
  await page.getByTestId("password-input").fill("Password123");
  await page.getByTestId("topic-select").selectOption("Billing");
  await page.getByTestId("message-textarea").fill("I need help with my latest invoice.");
  await page.getByTestId("contact-email-checkbox").check();
  await page.getByTestId("urgency-high-radio").check();

  await page.getByTestId("submit-button").click();

  await expect(page.getByTestId("form-error-message")).toBeHidden();
  await expect(page.getByTestId("form-success-message")).toHaveText("Form submitted successfully");
});
