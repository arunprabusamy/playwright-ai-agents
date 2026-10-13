import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000/table");
});

test("add a new user and verify it is available in the table", async ({ page }) => {
  const name = `Test User ${Date.now()}`;
  const email = `test.user.${Date.now()}@hourtolearn.dev`;

  await page.getByTestId("add-user-name-input").fill(name);
  await page.getByTestId("add-user-email-input").fill(email);
  await page.getByTestId("add-user-role-select").selectOption("Editor");
  await page.getByTestId("add-user-age-input").fill("29");
  await page.getByTestId("add-user-submit").click();

  await expect(page.getByTestId("add-user-error-message")).toBeHidden();

  await page.getByTestId("table-search-input").fill(name);

  const row = page.getByTestId("table-body").getByRole("row", { name });
  await expect(row).toHaveCount(1);
  await expect(row).toContainText(email);
  await expect(row).toContainText("Editor");
  await expect(row).toContainText("29");
});
