import { expect, test } from "@playwright/test";

test.beforeEach("load table page", async ({ page }) => {
  await page.goto("http://localhost:3000/table");
});

test("adding a user shows them in the table", async ({ page }) => {
  await page.getByTestId("add-user-name-input").fill("Nila");
  await page.getByTestId("add-user-email-input").fill("nila@hourtolearn.dev");

  // the form submit resets the table's search/page state and refetches —
  // wait for that refetch to land before searching, otherwise it can race
  // with (and overwrite) the search request below
  await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url().includes("/api/users") && res.request().method() === "GET"
    ),
    page.getByTestId("add-user-submit").click()
  ]);

  // search filters the table so the new user is findable regardless of
  // which page it landed on
  await page.getByTestId("table-search-input").fill("Nila");

  await expect(page.getByTestId("table-body")).toContainText("Nila");
});

test("adding a user shows them on one of the table's pages", async ({
  page
}) => {
  await page.getByTestId("add-user-name-input").fill("Nila");
  await page.getByTestId("add-user-email-input").fill("nila@hourtolearn.dev");

  // the form submit resets the table's page state and refetches —
  // wait for that refetch to land before reading the page count below
  await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url().includes("/api/users") && res.request().method() === "GET"
    ),
    page.getByTestId("add-user-submit").click()
  ]);

  const pageInfoText = await page.getByTestId("table-page-info").textContent();
  const totalPages = Number(pageInfoText?.match(/of (\d+)/)?.[1]);

  // walk every page (instead of searching) and check the table body
  // directly for the new user, advancing with "Next" until found or
  // until the last page is reached
  let found = false;
  for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
    found =
      (await page.getByTestId("table-body").textContent())?.includes("Nila") ??
      false;
    if (found || currentPage === totalPages) break;

    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes("/api/users") && res.request().method() === "GET"
      ),
      page.getByTestId("table-next-page").click()
    ]);
  }

  expect(found).toBe(true);
});
