import { expect, test } from "@playwright/test";

test.beforeEach("load date picker page", async ({ page }) => {
  await page.goto("http://localhost:3000/date-picker");
});

test("native date input shows the selected date", async ({ page }) => {
  // build 25th dynamically — a hardcoded date like "2026-12-25"
  // would stop matching once that month passes
  const today = new Date();
  const day = "25";
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = String(today.getFullYear());
  const isoDate = `${year}-${month}-${day}`;

  await page.getByTestId("native-date-input").click();
  await page
    .getByTestId("native-date-days")
    .locator("button.range-day:not(.is-outside-month)") // skip filler days from adjacent months — numbers can repeat
    .filter({ hasText: new RegExp(`^${day}$`) }) // exact match so "2" doesn't also match "25"
    .click();

  await expect(page.getByTestId("native-date-output")).toHaveText(
    `Selected date: ${isoDate}`
  );
});
