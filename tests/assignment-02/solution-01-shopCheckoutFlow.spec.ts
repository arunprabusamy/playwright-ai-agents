import { test, expect } from "@playwright/test";

const PRODUCT_ID = 11; // "2-Person Camping Tent" - in stock, Fitness & Outdoors, $149.99

test.describe("Shop & checkout flow (normal path)", () => {
  test("walks through shop filtering, wishlist, reviews, cart and a successful checkout", async ({
    page
  }) => {
    await test.step("Step 1-2: dismiss the cookie-consent banner on /shop", async () => {
      await page.goto("http://localhost:3000/shop");
      await expect(page.getByTestId("cookie-consent-banner")).toBeVisible();
      await page.getByTestId("cookie-consent-accept").click();
      await expect(page.getByTestId("cookie-consent-banner")).toBeHidden();
    });

    await test.step("Step 3: filter via the category combobox using the keyboard only", async () => {
      const categoryInput = page.getByTestId("shop-category-input");
      await categoryInput.click();
      await page.keyboard.press("ArrowDown"); // focus already lands on "All Categories"; this moves to "Electronics"
      await page.keyboard.press("Enter");

      await expect(categoryInput).toHaveAttribute("aria-expanded", "false");
      await expect(page.getByTestId("shop-category-combobox")).toHaveAttribute(
        "data-value",
        "Electronics"
      );

      const categoryBadges = page.getByTestId(/^product-category-/);
      await expect(categoryBadges.first()).toBeVisible();
      for (const badge of await categoryBadges.all()) {
        await expect(badge).toHaveText("Electronics");
      }

      // Reset back to the full catalog so later steps (scroll, wishlist, cart) have a
      // deterministic, unfiltered grid to work with.
      await categoryInput.click();
      await page.keyboard.press("ArrowUp");
      await page.keyboard.press("Enter");
      await expect(page.getByTestId("shop-category-combobox")).toHaveAttribute(
        "data-value",
        "all"
      );
    });

    await test.step("Step 4: filter via the max-price slider using arrow keys only", async () => {
      const sliderTrack = page.getByTestId("shop-price-slider-track");
      await sliderTrack.focus();
      await page.keyboard.press("End"); // snap to max (300) for a deterministic starting point
      for (let i = 0; i < 40; i += 1) {
        await page.keyboard.press("ArrowLeft"); // step is 5, so 40 presses => 300 - 200 = 100
      }

      await expect(sliderTrack).toHaveAttribute("aria-valuenow", "100");
      await expect(page.getByTestId("shop-price-slider-value")).toHaveText(
        "$100"
      );

      // The slider itself updates its ARIA state synchronously, but the grid refetches
      // from the server asynchronously, so re-check the badges (not just the slider) until
      // the filtered set actually lands.
      const priceBadges = page.getByTestId(/^product-price-/);
      await expect(async () => {
        const prices = await priceBadges.allTextContents();
        expect(prices.length).toBeGreaterThan(0);
        for (const text of prices) {
          expect(Number(text.replace("$", ""))).toBeLessThanOrEqual(100);
        }
      }).toPass();

      // Reset to the max so the infinite-scroll step below has the full catalog to load.
      // Wait for a product above the old $100 ceiling to reappear, confirming the
      // unfiltered re-fetch has actually landed before later steps rely on the full catalog.
      await sliderTrack.focus();
      await page.keyboard.press("End");
      await expect(sliderTrack).toHaveAttribute("aria-valuenow", "300");
      await expect(async () => {
        const prices = await priceBadges.allTextContents();
        expect(prices.some((text) => Number(text.replace("$", "")) > 100)).toBe(
          true
        );
      }).toPass();
    });

    await test.step("Step 5: scroll the grid repeatedly to trigger infinite scroll", async () => {
      const productCards = page.getByTestId(/^product-card-/);
      const initialCount = await productCards.count();

      await expect(async () => {
        await page.mouse.wheel(0, 2000);
        await expect(page.getByTestId("shop-end-of-results")).toBeVisible();
      }).toPass({ timeout: 15000 });

      expect(await productCards.count()).toBeGreaterThan(initialCount);
    });

    await test.step('Step 6: add a product to the wishlist via the "..." menu button', async () => {
      await page.getByTestId(`product-menu-button-${PRODUCT_ID}`).click();
      await expect(
        page.getByTestId(`product-context-menu-${PRODUCT_ID}`)
      ).toBeVisible();

      const wishlistMenuItem = page.getByTestId(
        `context-menu-wishlist-${PRODUCT_ID}`
      );
      await expect(wishlistMenuItem).toHaveText("Add to wishlist");
      await wishlistMenuItem.click();

      const heart = page.getByTestId(`product-wishlist-heart-${PRODUCT_ID}`);
      await expect(heart).toBeVisible();
      await expect(heart).toHaveText("♥");
      await expect(page.getByTestId("shop-toast-message")).toContainText(
        "Added"
      );
    });

    await test.step("Step 7-8: open the product detail page and submit a review in the shadow-DOM widget", async () => {
      await page.getByTestId(`product-name-${PRODUCT_ID}`).click();
      await expect(page).toHaveURL(
        `http://localhost:3000/shop-product?id=${PRODUCT_ID}`
      );
      await expect(page.getByTestId("product-reviews-widget")).toBeVisible();

      const reviewComment = `Great buy, delivered fast - ${Date.now()}`;
      await page.getByTestId("product-review-author-input").fill("QA Tester");
      await page.getByTestId("product-review-rating-select").selectOption("5");
      await page
        .getByTestId("product-review-comment-input")
        .fill(reviewComment);
      await page.getByTestId("product-review-submit").click();

      await expect(page.getByTestId("product-reviews-list")).toContainText(
        reviewComment
      );
    });

    await test.step("Step 9-10: add to cart, then grow the quantity with the + stepper", async () => {
      await page.getByTestId("product-detail-add-to-cart").click();
      await page.goto("http://localhost:3000/cart");

      const cartRow = page.getByTestId(`cart-row-${PRODUCT_ID}`);
      await expect(cartRow).toBeVisible();

      // cart.js fully re-renders the row on every quantity change, so re-querying locators
      // by testid (rather than holding an element handle) is what keeps this step reliable.
      await page.getByTestId(`cart-qty-increment-${PRODUCT_ID}`).click();
      await expect(
        page.getByTestId(`cart-qty-input-${PRODUCT_ID}`)
      ).toHaveValue("2");
      await expect(
        page.getByTestId(`cart-line-total-${PRODUCT_ID}`)
      ).toHaveText("$299.98");
    });

    await test.step("Step 11-12: proceed to checkout while logged out, then sign in", async () => {
      await page.getByTestId("cart-checkout-button").click();
      await expect(page).toHaveURL(
        "http://localhost:3000/store-login?next=/checkout"
      );

      await page.getByTestId("store-login-username").fill("shopper");
      await page.getByTestId("store-login-password").fill("Shop123!");
      await page.getByTestId("store-login-submit").click();

      await expect(page).toHaveURL("http://localhost:3000/checkout");
      await expect(page.getByTestId("checkout-step-shipping")).toBeVisible();
    });

    await test.step("Step 13: fill shipping, selecting the country combobox by keyboard only", async () => {
      await page.getByTestId("checkout-fullname-input").fill("Jane Shopper");
      await page.getByTestId("checkout-address1-input").fill("123 Main St");
      await page.getByTestId("checkout-city-input").fill("Springfield");
      await page.getByTestId("checkout-state-input").fill("IL");
      await page.getByTestId("checkout-postal-input").fill("62704");

      await page.getByTestId("checkout-country-input").click();
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
      await expect(
        page.getByTestId("checkout-country-combobox")
      ).toHaveAttribute("data-value", "United States");

      await page.getByTestId("checkout-shipping-continue-button").click();
      await expect(page.getByTestId("checkout-step-verify")).toBeVisible();
    });

    await test.step("Step 14: send and submit the sandbox OTP", async () => {
      await page.getByTestId("checkout-send-otp-button").click();
      await expect(page.getByTestId("otp-sandbox-hint")).toBeVisible();

      const code = await page.getByTestId("otp-sandbox-code").textContent();
      await page.getByTestId("checkout-otp-input").fill(code ?? "");
      await page.getByTestId("checkout-verify-otp-button").click();

      await expect(page.getByTestId("checkout-step-payment")).toBeVisible();
    });

    await test.step("Step 15-16: pay with the always-succeeds card via the sandboxed iframe, then place the order", async () => {
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
      await expect(
        page.getByTestId("checkout-place-order-button")
      ).toBeEnabled();

      await page.getByTestId("checkout-place-order-button").click();
      await expect(page).toHaveURL("http://localhost:3000/order-confirmation");
      await expect(
        page.getByTestId("order-confirmation-order-number")
      ).toHaveText(/^ORD-\d+$/);
    });
  });

  test("retries payment twice before succeeding on the decline-twice test card", async ({
    page
  }) => {
    await test.step("sign in and add a product to a fresh cart", async () => {
      await page.goto("http://localhost:3000/store-login");
      await page.getByTestId("store-login-username").fill("shopper");
      await page.getByTestId("store-login-password").fill("Shop123!");
      await page.getByTestId("store-login-submit").click();

      await expect(page).toHaveURL("http://localhost:3000/shop");
      await page.getByTestId("cookie-consent-accept").click();
      await page.getByTestId(`product-add-to-cart-${PRODUCT_ID}`).click();
    });

    await test.step("Step 13-14: fill shipping and verify OTP for a new checkout attempt", async () => {
      await page.goto("http://localhost:3000/checkout");
      await page.getByTestId("checkout-fullname-input").fill("Jane Shopper");
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
    });

    await test.step("Step 17: the decline-twice card fails twice with a visible retry state, then succeeds", async () => {
      const paymentFrame = page
        .getByTestId("payment-widget-frame")
        .contentFrame();
      await paymentFrame
        .getByTestId("payment-card-number-input")
        .fill("4000 0000 0000 9995");
      await paymentFrame.getByTestId("payment-card-submit-button").click();

      // Pin the exact decline-twice-then-succeed progression (not just "the word
      // 'attempt' appeared at some point"), so a regression to always-decline or
      // always-succeed on this card would fail this assertion. Each hop is a real
      // network round-trip plus the server's own ~1.2s retry backoff, so these get
      // a generous timeout rather than the default 5s.
      const retryIndicator = page.getByTestId(
        "checkout-payment-retrying-indicator"
      );
      await expect(retryIndicator).toHaveText(/attempt 2 of 3/i, {
        timeout: 10000
      });
      await expect(retryIndicator).toHaveText(/attempt 3 of 3/i, {
        timeout: 10000
      });
      await expect(
        page.getByTestId("checkout-payment-confirmed-message")
      ).toBeVisible({ timeout: 10000 });
      await expect(
        page.getByTestId("checkout-place-order-button")
      ).toBeEnabled();

      await page.getByTestId("checkout-place-order-button").click();
      await expect(page).toHaveURL("http://localhost:3000/order-confirmation");
    });
  });
});
