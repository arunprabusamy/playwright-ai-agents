import { expect, test } from "@playwright/test";

test.beforeEach("load drag & drop page", async ({ page }) => {
  await page.goto("http://localhost:3000/drag-drop");
});

test("dragging a card moves it from To Do to In Progress", async ({ page }) => {
  const card = page.getByTestId("kanban-card-1");
  const todoColumn = page.getByTestId("kanban-column-todo");
  const inProgressColumn = page.getByTestId("kanban-column-in-progress");

  await expect(card).toHaveText("Write a locator strategy doc");

  await card.dragTo(inProgressColumn.locator("[data-dropzone]"));

  await expect(todoColumn).not.toContainText("Write a locator strategy doc");
  await expect(inProgressColumn).toContainText("Write a locator strategy doc");
});
