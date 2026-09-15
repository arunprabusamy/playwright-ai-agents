# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

This is a Playwright learning/course project. `tests/` is not a typical spec suite for a single
app — it's a numbered progression of exercises (`01-...` through `10-...`) building up Playwright
concepts step by step, plus a couple of scaffold files from `npm init playwright` (`example.spec.ts`,
`test-1.spec.ts`). Expect exploratory/commented-out code left in place intentionally as teaching
artifacts (e.g. `07-TestFlow.spec.ts` has a skipped test and commented alternate locators) — don't
"clean up" such things unless asked.

Most `.spec.ts` tests target a local app at `http://localhost:3000/` (referred to in test titles as
"HourToLearn") that is NOT part of this repo — it must be running separately for browser/API tests
to pass. `test-1.spec.ts` and `example.spec.ts` hit `http://localhost:3000` and `https://playwright.dev`
respectively.

Two files (`01-javaScript.js`, `02-typeScript.ts`, `03-typeScriptFunction.ts`) are plain
Node/TypeScript snippets with no Playwright imports — they are not runnable Playwright tests and
will be skipped/fail if run through the test runner. Treat `tests/` as a mixed folder, not a pure
spec directory.

## Commands

There are no npm scripts defined in `package.json` — use the Playwright CLI directly.

```bash
# Run all tests (headless, all configured projects)
npx playwright test

# Run a single test file
npx playwright test tests/10-loginTestcase.spec.ts

# Run a single test by title
npx playwright test -g "validate login functionality"

# Run headed / with the UI mode runner
npx playwright test --headed
npx playwright test --ui

# Debug a specific test (opens Playwright Inspector)
npx playwright test tests/06-debug_traceViewer.spec.ts --debug

# View the HTML report after a run (reporter is "html" in playwright.config.ts)
npx playwright show-report

# View a trace for a failed test
npx playwright show-trace test-results/<test-folder>/trace.zip

# Generate a new test via codegen against the local app
npx playwright codegen http://localhost:3000/
```

The `01-javaScript.js` / `02-typeScript.ts` / `03-typeScriptFunction.ts` files are not Playwright
tests; run them with `node` / `npx ts-node` if needed, not `playwright test`.

## Architecture / config notes

- `playwright.config.ts`: `testDir` is `./tests`; `fullyParallel: true`; only the `chromium` project
  is enabled (firefox/webkit/mobile/branded-browser projects are present but commented out — enable
  them there, not by adding new config elsewhere); `trace: "on-first-retry"`; reporter is `"html"`.
  There is no `baseURL` set and no `webServer` block, so every test calls `page.goto(...)` with a
  full URL and the target app must already be running at `http://localhost:3000/` before tests
  execute.
- No page-object model or shared fixtures/helpers exist yet — every test file is self-contained and
  interacts with the page directly via `page.getByTestId(...)` / `page.getByRole(...)`. If asked to
  add shared setup, prefer Playwright fixtures or a `test.beforeEach` in the relevant file, matching
  the existing style (see `07-TestFlow.spec.ts` and `10-loginTestcase.spec.ts` for the
  `beforeEach` + `page.goto` pattern already in use).
- API testing (`08-apiTestcase.spec.ts`) uses the `request` fixture directly against
  `http://localhost:3000/api/users`. Response mocking (`09-apiMockResponse.spec.ts`) uses
  `page.route(...)` + `route.fulfill(...)` to stub that same endpoint — follow this pattern for any
  new mocked-API tests rather than introducing a separate mocking library.
- Locators consistently prefer `getByTestId(...)` (data-testid attributes on the target app) with
  `getByRole(...)` used as an alternative/fallback in a couple of tests — prefer `getByTestId` for
  new tests unless matching an existing test's style.
