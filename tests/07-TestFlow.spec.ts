import { expect, test } from "@playwright/test";

test.beforeEach("load application", async ({ page }) => {
  await page.goto("http://localhost:3000/");
});

test("validate Forms", async ({ page }) => {
  await page.getByTestId("home-card-forms").click();
  // await page.getByTestId("full-name-input").click();
  // await page.getByTestId("full-name-input").fill("testuser");
  await page.getByRole("textbox", { name: "Full name" }).click();
  await page.getByRole("textbox", { name: "Full name" }).fill("aria-tester");
});

test.skip("validate Date Picker", async ({ page }) => {
  await page.getByTestId("home-card-date-picker").click();
  await expect(
    page.getByRole("heading", { name: "Native date input", level: 2 })
  ).toBeVisible();
});
