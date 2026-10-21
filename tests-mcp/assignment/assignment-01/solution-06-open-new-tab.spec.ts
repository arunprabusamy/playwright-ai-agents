import { expect, test } from "@playwright/test";

test.beforeEach("load frames & windows page", async ({ page }) => {
  await page.goto("http://localhost:3000/frames-windows");
});

test("open in new tab link opens the Dynamic Content page", async ({
  page
}) => {
  // set up the wait before clicking, since Playwright can't know in advance
  // that the click will open a tab — 'popup' only fires for pages opened
  // from this page (target="_blank" / window.open), unlike context's 'page'
  // event, which would catch any new page in the whole context
  const newTabPromise = page.waitForEvent("popup");
  await page.getByTestId("open-new-tab-link").click();
  const newTab = await newTabPromise;

  await expect(newTab).toHaveURL("http://localhost:3000/dynamic-content");
  await expect(newTab.getByTestId("page-title")).toHaveText("Dynamic Content");
});
