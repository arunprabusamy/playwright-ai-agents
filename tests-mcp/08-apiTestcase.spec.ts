import { test, expect } from "@playwright/test";

test("apiTest", async ({ request }) => {
  const userResponse = await request.get("http://localhost:3000/api/users");
  console.log(userResponse);
  expect(userResponse.ok()).toBeTruthy();

  console.log(await userResponse.json());

  const userBody = await userResponse.json();
  console.log("First user" + userBody.data[0].name);
});
