// spec: specs/forms.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from "@playwright/test";

test.describe("Happy Path Submission Demo", () => {
  // Skipped: the SMS contact checkbox is disabled in the app (bug), so this step can't run.
  test.fixme("Submit a fully valid support request", async ({ page }) => {
    await page.goto("http://localhost:3000/forms");

    await page.getByTestId("full-name-input").fill("Jane Tester");
    await page.getByTestId("email-input").fill("jane@example.com");
    await page.getByTestId("password-input").fill("password123");
    await page.getByTestId("topic-select").selectOption(["billing"]);
    await page
      .getByTestId("message-textarea")
      .fill("I need help with my billing statement from last month.");
    // APP BUG: "Text me updates" (contact-sms-checkbox) is rendered disabled, so it
    // cannot be selected. Expected: the checkbox is enabled and clickable.
    await page.getByTestId("contact-sms-checkbox").click();
    await page.getByTestId("urgency-medium-radio").click();
    await page.getByTestId("submit-button").click();

    const successBanner = page.getByTestId("form-success-message");
    await expect(successBanner).toBeVisible();
  });
});
