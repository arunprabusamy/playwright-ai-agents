# Assignment: Automating the Shop & Checkout Flow

## Context

The HourToLearn practice app at `http://localhost:3000/` includes a shop alongside the
forms, table, and calendar pages. The shop pages are `/shop`, `/shop/<product>`, `/cart`,
`/store-login`, `/checkout`, and `/store-account`.

These two test cases combine several UI challenges: overlays that block clicks, custom widgets,
shadow DOM, iframes, payment retries, and state that must survive multiple checkout steps.
Automate both test cases as Playwright test files. Use the steps as test goals: inspect the app,
choose reliable locators, and write tests that can handle changes in the UI.

**Precondition for both test cases:** the app is running at `http://localhost:3000/`.

---

## Test Case 1 — End-to-End Shopping & Checkout (Normal Flow)

**Objective:** Complete a shopping and checkout journey, including the interactive elements
along the way.

**Precondition:** Fresh browser session (cookie-consent banner not yet dismissed).

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/shop` | Cookie-consent banner is visible, overlapping the lower part of the page |
| 2 | Dismiss the cookie-consent banner | Banner closes; nothing underneath it is blocked anymore |
| 3 | Use the category combobox (keyboard only: click to open, Arrow keys to move, Enter to select) | Combobox filters the grid without a native `<select>`; selection reflected via `aria-activedescendant` |
| 4 | Drag or arrow-key the max-price slider to a lower value | Product grid re-filters to only show items at or under that price |
| 5 | Scroll down the product grid repeatedly | More products load automatically (infinite scroll) without a "next page" click |
| 6 | Right-click a product card image (or use the "⋮" button) → "Add to wishlist" | Heart icon toggles on; a toast confirms the action |
| 7 | Open that product's detail page | Customer Reviews widget is visible and functional (shadow DOM) |
| 8 | Submit a new review in that widget | Review appears in the list immediately |
| 9 | Add the product to the cart, go to `/cart` | Item appears as a row |
| 10 | Increase quantity using the `+` stepper | Line total updates; row is fully re-rendered (any held element reference from before this click is now stale) |
| 11 | Click "Proceed to checkout" (not logged in) | Redirected to `/store-login?next=/checkout` |
| 12 | Log in as `shopper` / `Shop123!` | Redirected back to `/checkout`, lands on Shipping step |
| 13 | Fill shipping form, using the Country combobox (keyboard only) | Validation passes, advances to Verify step |
| 14 | Click "Send code," read the on-page sandbox OTP hint, enter it | OTP accepted, advances to Payment & Review step |
| 15 | Enter card number `4242 4242 4242 4242` in the payment field (lives inside an iframe) | Payment succeeds immediately; parent page receives confirmation via the iframe's `postMessage` |
| 16 | Click "Place order" | Redirected to Order Confirmation page with correct order details |
| 17 | Repeat step 15 with `4000 0000 0000 9995` instead (new checkout attempt) | First two attempts fail with a visible retry/backoff state; third attempt succeeds |

For step 17, a new checkout attempt means adding a product to the cart again and completing
Shipping and Verify before entering the second card. In step 3, `aria-activedescendant` shows
the active option while using the arrow keys; it is cleared after pressing Enter. If the
filters in steps 3–4 leave too few products to scroll in step 5, reset them before scrolling.

**Elements covered:** click-interception (cookie banner), custom combobox ×2, non-native slider,
infinite scroll, context menu, shadow DOM, stale-element cart re-render, OTP/2FA, sandboxed
payment iframe, flaky/retry payment.

---

## Test Case 2 — Account Personas, Order History & Checkout Resume

**Objective:** Test account-specific login behavior, the scrollable order history, the spending
chart, and checkout progress after a refresh.

**Precondition:** App running at `http://localhost:3000/`.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Go to `/store-login`, log in as `locked_shopper` / `Shop123!` | Login is rejected with a 403 "account locked" message |
| 2 | Log in as `slow_shopper` / `Shop123!` | Login takes ~4 seconds before succeeding — confirm the test waits rather than failing on a timeout |
| 3 | Navigate to `/store-account` | Order History panel is a fixed-height scrollable container (not full-page scroll) |
| 4 | Scroll inside that container (not the window) to reach older orders | Older orders become visible; a "Reorder" action is only reachable after scrolling within the container |
| 5 | Locate the Spending-by-Month chart | Rendered on a `<canvas>` element — not inspectable via normal DOM text assertions |
| 6 | Read the values from the visually-hidden data table paired with the chart | Values are accessible via the DOM and should match what the chart visually represents |
| 7 | Log out, log back in as `glitchy_shopper` / `Shop123!` | Login succeeds normally (no visible error) |
| 8 | Add an item to cart and proceed through checkout to Payment & Review (OTP + `4242...4242` card) | Flow completes without errors |
| 9 | Compare the displayed total against `subtotal + (subtotal × tax rate) + shipping` | Total is higher than expected — tax has been silently doubled for this account; assertion should catch the mismatch |
| 10 | Start a new checkout as `shopper`, fill the Shipping step, advance to Verify, then refresh the browser | Checkout wizard resumes at the Verify step with the previously entered shipping data intact (persisted via `sessionStorage`), not reset to step 1 |

For step 9, check the total on the Order Confirmation page after placing the order. The normal
tax rate is 8%; shipping is free for subtotals of $75 or more and $5.99 otherwise.

**Elements covered:** multi-persona broken logins (locked/slow/glitchy), scrollable inner
container, canvas-based chart with hidden data-table fallback, multi-step wizard
refresh-persistence.

---

## Test Data Reference

| Credential / Card | Value | Behavior |
|---|---|---|
| Normal shopper | `shopper` / `Shop123!` | Logs in immediately |
| Locked account | `locked_shopper` / `Shop123!` | Always rejected, HTTP 403 |
| Slow account | `slow_shopper` / `Shop123!` | Succeeds after a ~4s delay |
| Glitchy account | `glitchy_shopper` / `Shop123!` | Logs in fine, but checkout silently doubles the tax |
| Always-succeeds card | `4242 4242 4242 4242` | Payment succeeds on the first attempt |
| Decline-twice card | `4000 0000 0000 9995` | Fails on attempts 1 and 2, succeeds on attempt 3 |
| Always-declines card | `4000 0000 0000 0002` | Always declines (not exercised by these two test cases, but useful for your own edge-case tests) |

## Deliverable

Two Playwright spec files under `tests/` that automate Test Case 1 and Test Case 2, following
this repo's existing conventions (`getByTestId` locators, `test.beforeEach` + `page.goto`,
self-contained files, no page-object model).
