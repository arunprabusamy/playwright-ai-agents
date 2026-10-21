import { test, expect } from "@playwright/test";

const TAX_RATE = 0.08;

test.describe("Account personas, order history & checkout resume", () => {
  test("locked_shopper login is rejected with a 403 account-locked message", async ({
    page
  }) => {
    await page.goto("http://localhost:3000/store-login");
    await page.getByTestId("store-login-username").fill("locked_shopper");
    await page.getByTestId("store-login-password").fill("Shop123!");

    const [response] = await Promise.all([
      page.waitForResponse("**/api/store/login"),
      page.getByTestId("store-login-submit").click()
    ]);

    expect(response.status()).toBe(403);
    await expect(page.getByTestId("store-login-error-message")).toContainText(
      /locked/i
    );
  });

  test("slow_shopper logs in successfully after the ~4s server-side delay", async ({
    page
  }) => {
    await page.goto("http://localhost:3000/store-login");
    await page.getByTestId("store-login-username").fill("slow_shopper");
    await page.getByTestId("store-login-password").fill("Shop123!");
    await page.getByTestId("store-login-submit").click();

    await expect(
      page.getByTestId("store-login-loading-indicator")
    ).toBeVisible();
    // The login genuinely takes ~4s server-side; wait for the real redirect instead of a fixed sleep.
    await page.waitForURL("http://localhost:3000/shop", { timeout: 8000 });
  });

  test.describe("store-account page (logged in as shopper)", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("http://localhost:3000/store-login");
      await page.getByTestId("store-login-username").fill("shopper");
      await page.getByTestId("store-login-password").fill("Shop123!");
      await page.getByTestId("store-login-submit").click();
      await expect(page).toHaveURL("http://localhost:3000/shop");

      await page.goto("http://localhost:3000/store-account");
    });

    test("order history panel requires scrolling its own container to reach older rows", async ({
      page
    }) => {
      const scrollContainer = page.getByTestId(
        "order-history-scroll-container"
      );
      await expect(scrollContainer).toBeVisible();

      const oldestRow = page.getByTestId(/^order-history-row-/).last();
      const oldestReorderButton = oldestRow.getByTestId(
        /^order-history-reorder-/
      );

      await expect(oldestReorderButton).not.toBeInViewport();

      await scrollContainer.hover();
      await expect(async () => {
        await page.mouse.wheel(0, 1500);
        await expect(oldestReorderButton).toBeInViewport();
      }).toPass({ timeout: 10000 });

      await oldestReorderButton.click();
      await expect(
        page.getByTestId("store-account-toast-message")
      ).toContainText("Added items from");
    });

    test("spending chart renders on canvas, with the same data in an accessible table", async ({
      page
    }) => {
      // The canvas has no inspectable DOM for its pixels - the app's own design is to
      // render the identical data points into this sr-only table as the DOM-accessible
      // proxy for what the chart draws, so that's what assertions target.
      const canvas = page.getByTestId("spending-chart");
      await expect(canvas).toBeVisible();

      const dataRows = page
        .getByTestId("spending-chart-data-body")
        .locator("tr");
      await expect(dataRows.first()).toBeVisible();
      expect(await dataRows.count()).toBeGreaterThan(0);

      for (const row of await dataRows.all()) {
        await expect(row.locator("td").nth(1)).toHaveText(/^\$\d+\.\d{2}$/);
      }
    });
  });

  test.describe("glitchy_shopper persona", () => {
    test("logs in without a visible error", async ({ page }) => {
      await page.goto("http://localhost:3000/store-login");
      await page.getByTestId("store-login-username").fill("glitchy_shopper");
      await page.getByTestId("store-login-password").fill("Shop123!");
      await page.getByTestId("store-login-submit").click();

      await expect(page).toHaveURL("http://localhost:3000/shop");
      await expect(
        page.getByTestId("store-login-error-message")
      ).not.toBeVisible();
    });

    test("checkout bills tax at double the advertised rate", async ({
      page
    }) => {
      await page.goto("http://localhost:3000/store-login");
      await page.getByTestId("store-login-username").fill("glitchy_shopper");
      await page.getByTestId("store-login-password").fill("Shop123!");
      await page.getByTestId("store-login-submit").click();
      await expect(page).toHaveURL("http://localhost:3000/shop");

      await page.getByTestId("cookie-consent-accept").click();
      await page.getByTestId("product-add-to-cart-11").click();
      await page.goto("http://localhost:3000/checkout");

      await page.getByTestId("checkout-fullname-input").fill("Glitch Shopper");
      await page.getByTestId("checkout-address1-input").fill("123 Main St");
      await page.getByTestId("checkout-city-input").fill("Springfield");
      await page.getByTestId("checkout-state-input").fill("IL");
      await page.getByTestId("checkout-postal-input").fill("62704");
      await page.getByTestId("checkout-country-input").click();
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
      await page.getByTestId("checkout-shipping-continue-button").click();

      await page.getByTestId("checkout-send-otp-button").click();
      await expect(page.getByTestId("otp-sandbox-hint")).toBeVisible();

      const code = await page.getByTestId("otp-sandbox-code").textContent();
      await page.getByTestId("checkout-otp-input").fill(code ?? "");
      await page.getByTestId("checkout-verify-otp-button").click();
      await expect(page.getByTestId("checkout-step-payment")).toBeVisible();

      const paymentFrame = page
        .getByTestId("payment-widget-frame")
        .contentFrame();
      await paymentFrame
        .getByTestId("payment-card-number-input")
        .fill("4242 4242 4242 4242");
      await paymentFrame.getByTestId("payment-card-submit-button").click();
      await expect(
        page.getByTestId("checkout-payment-confirmed-message")
      ).toBeVisible();

      await page.getByTestId("checkout-place-order-button").click();
      await expect(page).toHaveURL("http://localhost:3000/order-confirmation");

      // All four fields render synchronously from sessionStorage on page load, so once one
      // has its final text the rest are already settled too - this sentinel just avoids
      // reading the pre-render DOM before the page's script has run.
      const subtotalEl = page.getByTestId("order-confirmation-subtotal");
      await expect(subtotalEl).toHaveText(/^\$\d+\.\d{2}$/);

      const subtotal = Number(
        (await subtotalEl.textContent())?.replace("$", "")
      );
      const shippingText = await page
        .getByTestId("order-confirmation-shipping")
        .textContent();
      const shippingFee =
        shippingText === "Free" ? 0 : Number(shippingText?.replace("$", ""));
      const actualTax = Number(
        (
          await page.getByTestId("order-confirmation-tax").textContent()
        )?.replace("$", "")
      );
      const actualTotal = Number(
        (
          await page.getByTestId("order-confirmation-total").textContent()
        )?.replace("$", "")
      );

      const expectedTax = Math.round(subtotal * TAX_RATE * 100) / 100;
      const expectedTotalWithDoubledTax =
        Math.round((subtotal + expectedTax * 2 + shippingFee) * 100) / 100;

      // Pin the specific regression this persona exercises: tax billed exactly double the
      // advertised rate, and the total reflecting that doubled tax end to end.
      expect(actualTax).toBeCloseTo(expectedTax * 2, 2);
      expect(actualTotal).toBeCloseTo(expectedTotalWithDoubledTax, 2);
    });
  });

  test("resumes the checkout wizard at the Verify step with shipping data intact after a refresh", async ({
    page
  }) => {
    await page.goto("http://localhost:3000/store-login");
    await page.getByTestId("store-login-username").fill("shopper");
    await page.getByTestId("store-login-password").fill("Shop123!");
    await page.getByTestId("store-login-submit").click();
    await expect(page).toHaveURL("http://localhost:3000/shop");

    await page.getByTestId("cookie-consent-accept").click();
    await page.getByTestId("product-add-to-cart-11").click();
    await page.goto("http://localhost:3000/checkout");

    await page.getByTestId("checkout-fullname-input").fill("Resume Test");
    await page.getByTestId("checkout-address1-input").fill("456 Resume Ave");
    await page.getByTestId("checkout-city-input").fill("Metropolis");
    await page.getByTestId("checkout-state-input").fill("NY");
    await page.getByTestId("checkout-postal-input").fill("10001");

    await page.getByTestId("checkout-country-input").click();
    await page.keyboard.press("ArrowDown"); // "United States"
    await page.keyboard.press("ArrowDown"); // "Canada"
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("checkout-country-combobox")).toHaveAttribute(
      "data-value",
      "Canada"
    );

    await page.getByTestId("checkout-shipping-continue-button").click();
    await expect(page.getByTestId("checkout-step-verify")).toBeVisible();

    // Progress is persisted client-side in sessionStorage ("htl-checkout-progress"), not
    // on the server, so a full page refresh is what actually proves it survived.
    await page.reload();

    await expect(page.getByTestId("checkout-step-verify")).toBeVisible();
    await expect(page.getByTestId("checkout-step-shipping")).toBeHidden();

    await page.getByTestId("checkout-back-to-shipping-button").click();
    await expect(page.getByTestId("checkout-fullname-input")).toHaveValue(
      "Resume Test"
    );
    await expect(page.getByTestId("checkout-address1-input")).toHaveValue(
      "456 Resume Ave"
    );
    await expect(page.getByTestId("checkout-country-combobox")).toHaveAttribute(
      "data-value",
      "Canada"
    );
  });
});
