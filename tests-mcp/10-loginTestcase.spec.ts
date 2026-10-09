import { expect, test } from "@playwright/test";

test.beforeEach("load login page", async ({ page }) => {
  await page.goto("http://localhost:3000/login");
});

test("validate login functionality", async ({ page }) => {
  await page.getByTestId("login-username").fill("student");
  await page.getByTestId("login-password").fill("Learn123!");
  await page.getByTestId("login-submit").click();

  await expect(page).toHaveURL("http://localhost:3000/account");
  await expect(page.getByTestId("account-welcome")).toHaveText(
    "Welcome, student!"
  );
  await expect(page.getByTestId("logout-button")).toBeVisible();
});
