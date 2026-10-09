import { test, expect } from "@playwright/test";

test.describe("Table page - mocked /api/users responses", () => {
  test("shows an empty table when the API returns no users", async ({ page }) => {
    await page.route("http://localhost:3000/api/users**", async (route) => {
      await route.fulfill({
        json: { data: [], total: 0, page: 1, pageSize: 5 },
      });
    });

    await page.goto("http://localhost:3000/table");

    await expect(page.getByTestId("table-body").locator("tr")).toHaveCount(0);
    await expect(page.getByTestId("table-page-info")).toHaveText("Page 1 of 1");
    await expect(page.getByTestId("table-prev-page")).toBeDisabled();
    await expect(page.getByTestId("table-next-page")).toBeDisabled();
    await expect(page.getByTestId("table-delete-selected")).toBeDisabled();
    await expect(page.getByTestId("table-select-all")).not.toBeChecked();
  });

  test("renders every user the API returns, even 20 in a single response", async ({
    page,
  }) => {
    const users = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@hourtolearn.dev`,
      role: "Viewer",
      age: 20 + i,
    }));

    await page.route("http://localhost:3000/api/users**", async (route) => {
      await route.fulfill({
        json: { data: users, total: users.length, page: 1, pageSize: 5 },
      });
    });

    await page.goto("http://localhost:3000/table");

    await expect(page.getByTestId("table-body").locator("tr")).toHaveCount(20);
    await expect(page.getByTestId("table-row-1")).toBeVisible();
    await expect(page.getByTestId("table-row-20")).toBeVisible();

    // The client paginates purely from `total`/pageSize (5) and never slices `data`
    // itself, so a response with 20 rows still renders all 20 while the pager
    // claims "Page 1 of 4" - a mismatch worth locking in a test for.
    await expect(page.getByTestId("table-page-info")).toHaveText("Page 1 of 4");
    await expect(page.getByTestId("table-prev-page")).toBeDisabled();
    await expect(page.getByTestId("table-next-page")).toBeEnabled();
  });
});
