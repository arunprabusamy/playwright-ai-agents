// spec: specs/forms.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Happy Path Submission', () => {
  test('Submit a fully valid support request', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/forms
    await page.goto('http://localhost:3000/forms');

    // expect: The 'Support request' form is visible with all fields empty/at default state
    await expect(page.getByRole('heading', { name: 'Support request' })).toBeVisible();
    await expect(page.getByTestId('full-name-input')).toHaveValue('');
    await expect(page.getByTestId('email-input')).toHaveValue('');
    await expect(page.getByTestId('password-input')).toHaveValue('');
    await expect(page.getByTestId('topic-select')).toHaveValue('');
    await expect(page.getByTestId('message-textarea')).toHaveValue('');
    await expect(page.getByTestId('contact-email-checkbox')).not.toBeChecked();
    await expect(page.getByTestId('urgency-medium-radio')).not.toBeChecked();

    // expect: No error or success banner is visible
    await expect(page.getByTestId('form-success-message')).toBeHidden();
    await expect(page.getByTestId('form-error-message')).toBeHidden();

    // 2. Fill 'full-name-input' with 'Jane Tester'
    await page.getByTestId('full-name-input').fill('Jane Tester');

    // 3. Fill 'email-input' with 'jane@example.com'
    await page.getByTestId('email-input').fill('jane@example.com');

    // 4. Fill 'password-input' with 'password123'
    await page.getByTestId('password-input').fill('password123');

    // 5. Select 'billing' in 'topic-select'
    await page.getByTestId('topic-select').selectOption(['billing']);

    // 6. Fill 'message-textarea' with 'I need help with my billing statement from last month.'
    await page.getByTestId('message-textarea').fill('I need help with my billing statement from last month.');

    // 7. Check the 'contact-email-checkbox'
    await page.getByTestId('contact-email-checkbox').click();

    // 8. Click the 'urgency-medium-radio'
    await page.getByTestId('urgency-medium-radio').click();

    // 9. Click the 'submit-button'
    await page.getByTestId('submit-button').click();

    // expect: A success banner with data-testid 'form-success-message' and role 'status' becomes visible with text 'Form submitted successfully'
    const successBanner = page.getByTestId('form-success-message');
    await expect(successBanner).toBeVisible();
    await expect(successBanner).toHaveAttribute('role', 'status');
    await expect(successBanner).toHaveText('Form submitted successfully');

    // expect: No error banner ('form-error-message') is shown
    await expect(page.getByTestId('form-error-message')).toBeHidden();

    // expect: None of the inline field error paragraphs (full-name-error, email-error, password-error, topic-error, message-error, urgency-error) are visible
    await expect(page.getByTestId('full-name-error')).toBeHidden();
    await expect(page.getByTestId('email-error')).toBeHidden();
    await expect(page.getByTestId('password-error')).toBeHidden();
    await expect(page.getByTestId('topic-error')).toBeHidden();
    await expect(page.getByTestId('message-error')).toBeHidden();
    await expect(page.getByTestId('urgency-error')).toBeHidden();

    // expect: All submitted field values remain populated (full name, email, password, topic, message, checkbox, radio all retain their entered/selected values)
    await expect(page.getByTestId('full-name-input')).toHaveValue('Jane Tester');
    await expect(page.getByTestId('email-input')).toHaveValue('jane@example.com');
    await expect(page.getByTestId('password-input')).toHaveValue('password123');
    await expect(page.getByTestId('topic-select')).toHaveValue('billing');
    await expect(page.getByTestId('message-textarea')).toHaveValue('I need help with my billing statement from last month.');
    await expect(page.getByTestId('contact-email-checkbox')).toBeChecked();
    await expect(page.getByTestId('urgency-medium-radio')).toBeChecked();
  });
});
