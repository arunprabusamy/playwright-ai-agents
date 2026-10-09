// spec: specs/forms.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Required Field Validation', () => {
  test('Submitting a completely empty form shows all required-field errors', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/forms
    await page.goto('http://localhost:3000/forms');

    // 2. Without filling any field, click 'submit-button'
    await page.getByTestId('submit-button').click();

    // expect: The error banner 'form-error-message' becomes visible with text 'Please fix the highlighted fields and try again.'
    await expect(page.getByTestId('form-error-message')).toBeVisible();
    await expect(page.getByTestId('form-error-message')).toHaveText('Please fix the highlighted fields and try again.');

    // expect: 'full-name-error' is visible with text 'Full name is required.'
    await expect(page.getByTestId('full-name-error')).toBeVisible();
    await expect(page.getByTestId('full-name-error')).toHaveText('Full name is required.');

    // expect: 'email-error' is visible with text 'A valid email is required.'
    await expect(page.getByTestId('email-error')).toBeVisible();
    await expect(page.getByTestId('email-error')).toHaveText('A valid email is required.');

    // expect: 'password-error' is visible with text 'Password must be at least 8 characters.'
    await expect(page.getByTestId('password-error')).toBeVisible();
    await expect(page.getByTestId('password-error')).toHaveText('Password must be at least 8 characters.');

    // expect: 'topic-error' is visible with text 'Please choose a topic.'
    await expect(page.getByTestId('topic-error')).toBeVisible();
    await expect(page.getByTestId('topic-error')).toHaveText('Please choose a topic.');

    // expect: 'message-error' is visible with text 'Please describe your issue.'
    await expect(page.getByTestId('message-error')).toBeVisible();
    await expect(page.getByTestId('message-error')).toHaveText('Please describe your issue.');

    // expect: 'urgency-error' is visible with text 'Please select an urgency level.'
    await expect(page.getByTestId('urgency-error')).toBeVisible();
    await expect(page.getByTestId('urgency-error')).toHaveText('Please select an urgency level.');

    // expect: No success banner is shown
    await expect(page.getByTestId('form-success-message')).not.toBeVisible();

    // expect: The invalid inputs (full-name-input, email-input, password-input, topic-select, message-textarea) are marked invalid (aria-invalid / [invalid] state)
    await expect(page.getByTestId('full-name-input')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByTestId('email-input')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByTestId('password-input')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByTestId('topic-select')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByTestId('message-textarea')).toHaveAttribute('aria-invalid', 'true');
  });
});
