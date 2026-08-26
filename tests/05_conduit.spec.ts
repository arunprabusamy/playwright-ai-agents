import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  // Recording...
  await page.goto('https://demo.realworld.show/');
  await page.getByRole('link', { name: 'ai', exact: true }).click();
  await page.getByText('ai').first().click();
  await page.getByRole('link', { name: 'Introduction to Machine' }).click();
  await expect(page.locator('h1').first()).toContainText('Introduction to Machine Learning for Developers');
});