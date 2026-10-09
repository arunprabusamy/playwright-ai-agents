import { expect, test } from "@playwright/test";

test.beforeEach("load frames & windows page", async ({ page }) => {
  await page.goto("http://localhost:3000/frames-windows");
});

test("typed message is echoed back inside the embedded frame", async ({
  page
}) => {
  // frameLocator enters the <iframe>, so getByTestId calls on it search
  // inside the frame's own document, not the main page
  const frame = page.frameLocator('[data-testid="embedded-frame"]');

  await frame.getByTestId("frame-input").fill("Hello Playwright");
  await frame.getByTestId("frame-button").click();

  await expect(frame.getByTestId("frame-message")).toHaveText(
    "Hello from inside the frame: Hello Playwright"
  );
});
