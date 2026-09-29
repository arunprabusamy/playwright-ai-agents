# Forms Page (Support Request Form) Test Plan

## Application Overview

This plan covers the "Support request" form on the HourToLearn demo app at http://localhost:3000/forms. The form (id="support-form", rendered with the HTML `novalidate` attribute) contains: a Full name text input (`full-name-input`), an Email input (`email-input`), a Password input (`password-input`, hint "At least 8 characters."), a Topic select (`topic-select` with options: "" placeholder, billing, technical, account, other), a Message textarea (`message-textarea`), a "Contact preferences" checkbox group (`contact-email-checkbox`, `contact-sms-checkbox`, `contact-phone-checkbox` — independently selectable, not mutually exclusive), an "How urgent is this?" radio group (`urgency-low-radio`, `urgency-medium-radio`, `urgency-high-radio` — mutually exclusive), and Submit (`submit-button`) / Reset (`reset-button`) buttons.

Validation is entirely custom client-side JS (native browser validation is disabled via `novalidate`) and only runs on Submit — no on-blur/on-change validation was observed. Each field has an associated hidden error paragraph that becomes visible on invalid submit: `full-name-error` ("Full name is required."), `email-error` ("A valid email is required."), `password-error` ("Password must be at least 8 characters."), `topic-error` ("Please choose a topic."), `message-error` ("Please describe your issue."), `urgency-error` ("Please select an urgency level."). Invalid fields also get an `aria-invalid`/`[invalid]` state. A page-level error banner with `data-testid="form-error-message"` (role="alert", text "Please fix the highlighted fields and try again.") appears above the form when any field is invalid on submit. On fully valid submit, a success banner with `data-testid="form-success-message"` (role="status", text "Form submitted successfully") appears in the same location and the form fields retain their submitted values (nothing is cleared). Whitespace-only input (e.g. spaces) in text fields such as Message is treated as empty/invalid by the validation logic (confirmed by direct testing), so it is presumed the same trimming applies to Full name. Contact preferences checkboxes and urgency radios have no error shown if left unchecked except urgency, which is required (produces `urgency-error`); checkboxes appear optional (no error observed for leaving all unchecked in the empty-submit case — errors observed were only for name, email, password, topic, message, and urgency). Clicking Reset (type="reset") clears all field values, unchecks all checkboxes/radios, resets the select to the placeholder option, and clears both the error banner/inline errors and the success banner, regardless of the form's current validity/success state.

## Test Scenarios

### 1. Happy Path Submission

**Seed:** `tests/seed.spec.ts`

#### 1.1. Submit a fully valid support request

**File:** `tests/forms/happy-path.spec.ts`

**Steps:**

1. Navigate to http://localhost:3000/forms


    - expect: The 'Support request' form is visible with all fields empty/at default state
    - expect: No error or success banner is visible

2. Fill 'full-name-input' with 'Jane Tester'
3. Fill 'email-input' with 'jane@example.com'
4. Fill 'password-input' with 'password123'
5. Select 'billing' in 'topic-select'
6. Fill 'message-textarea' with 'I need help with my billing statement from last month.'
7. Check the 'contact-email-checkbox'
8. Click the 'urgency-medium-radio'
9. Click the 'submit-button'


    - expect: A success banner with data-testid 'form-success-message' and role 'status' becomes visible with text 'Form submitted successfully'
    - expect: No error banner ('form-error-message') is shown
    - expect: None of the inline field error paragraphs (full-name-error, email-error, password-error, topic-error, message-error, urgency-error) are visible
    - expect: All submitted field values remain populated (full name, email, password, topic, message, checkbox, radio all retain their entered/selected values)

### 2. Required Field Validation

**Seed:** `tests/seed.spec.ts`

#### 2.1. Submitting a completely empty form shows all required-field errors

**File:** `tests/forms/required-field-validation.spec.ts`

**Steps:**

1. Navigate to http://localhost:3000/forms
2. Without filling any field, click 'submit-button'


    - expect: The error banner 'form-error-message' becomes visible with text 'Please fix the highlighted fields and try again.'
    - expect: 'full-name-error' is visible with text 'Full name is required.'
    - expect: 'email-error' is visible with text 'A valid email is required.'
    - expect: 'password-error' is visible with text 'Password must be at least 8 characters.'
    - expect: 'topic-error' is visible with text 'Please choose a topic.'
    - expect: 'message-error' is visible with text 'Please describe your issue.'
    - expect: 'urgency-error' is visible with text 'Please select an urgency level.'
    - expect: No success banner is shown
    - expect: The invalid inputs (full-name-input, email-input, password-input, topic-select, message-textarea) are marked invalid (aria-invalid / [invalid] state)
