import { expect, test } from "@playwright/test";
 
test.beforeEach("load calendar page", async ({ page }) => {
  await page.goto("http://localhost:3000/calendar");
});
 
test("adding and deleting an event updates the selected date", async ({
  page,
}) => {
  // 5 days out stays inside the visible month grid, so no "Next month" click is needed
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 5);
  const isoDate = futureDate.toISOString().slice(0, 10);
  const eventText = "Team sync";
 
  const dayCell = page.getByTestId(`calendar-day-${isoDate}`);
 
  await dayCell.click();
  await page.getByTestId("calendar-event-input").fill(eventText);
  await page.getByTestId("calendar-event-save").click();
 
  await expect(dayCell).toContainText(eventText);
 
  await dayCell
    .getByRole("button", { name: `Delete event ${eventText}` }) // locator chaining: scoped to this day cell, plus an exact event name, so it won't match delete buttons for other days' events
    .click();
 
  await expect(dayCell).not.toContainText(eventText);
});
