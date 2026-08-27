import { test, expect } from "@playwright/test";
import mockusers from "../mocks/getUsers.json";

test("test api mocking", async ({ page }) => {
  // const mockusers = {
  //   data: [
  //     {
  //       id: 1,
  //       name: "testUser",
  //       email: "ourOwn@hourtolearn.dev",
  //       role: "Admin",
  //       age: 18
  //     }
  //   ],
  //   total: 1,
  //   page: 1,
  //   pageSize: 1
  // };

  await page.route("http://localhost:3000/api/users**", async (route) => {
    await route.fulfill({ json: mockusers });
  });

  await page.goto("http://localhost:3000/");
  await page.getByRole("link", { name: "Table", exact: true }).click();

  await expect(
    page.getByRole("cell").filter({ hasText: "testUser" })
  ).toBeVisible();
});
