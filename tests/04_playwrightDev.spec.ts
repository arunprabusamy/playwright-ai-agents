import { test, expect } from '@playwright/test';


test('get started link', async ({ page }) => {
  const getStartedLink = page.getByRole('link', { name: 'Get started' });
  await page.goto('https://playwright.dev/');
  await getStartedLink.click();
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});

test('test', async ({ page }) => {
  await page.goto('https://demo.realworld.show/');
  await page.getByRole('link', { name: 'ai', exact: true }).click();
  await page.getByText('ai').first().click();
  await page.getByRole('link', { name: 'Introduction to Machine' }).click();
  await expect(page.locator('h1').first()).toContainText('Introduction to Machine Learning for Developers');
});

