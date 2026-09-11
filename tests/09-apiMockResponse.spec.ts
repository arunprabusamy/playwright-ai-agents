import { test, expect } from "@playwright/test";

test("mock api Response", async ({ page }) => {
  // mock response from http://localhost:3000/api/users

  const serviceUnavailable = {
    error: "Service unavailable",
    message: "The service is temporarily unavailable. Please try again later",
    statusCode: 503
  };

  await page.route("http://localhost:3000/api/users**", async (route) => {
    await route.fulfill({ status: 503, json: serviceUnavailable });
  });

  await page.goto("http://localhost:3000");
  await page.getByTestId("home-card-table").click;

  await expect(
    page.getByText(
      "The service is temporarily unavailable. Please try again later"
    )
  ).toBeVisible();
});
