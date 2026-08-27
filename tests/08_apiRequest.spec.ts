import { test, expect } from "@playwright/test";
import newUser from "../mocks/newUser.json";

test("Performing API and UI test together", async ({ page, request }) => {
  // send api request
  newUser.name = newUser.name + Date.now();
  const response = await request.post("http://localhost:3000/api/users", {
    data: newUser
  });
  expect(response.ok()).toBeTruthy;

  // verify through UI
  await page.goto("http://localhost:3000/table");
  console.log(newUser.name);
  await expect(page.getByText(newUser.name));
  await expect(page.getByText(newUser.email));
});
