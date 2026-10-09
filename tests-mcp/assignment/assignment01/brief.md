# Playwright + TypeScript Assignment: Automate Real UI Scenarios
 
## Description
Apply what you've learned about Playwright locators, actions, and assertions in TypeScript
to six hands-on, real-world UI scenarios: date inputs, dynamic tables, drag-and-drop,
calendar events, and working with frames and new tabs. Each test case is independent —
navigate, act, assert.
 
## Estimated Time
2–2.5 hours (roughly 15–25 minutes per test case).
 
## Prerequisites
- HourToLearn `https://github.com/arunprabusamy/hourtolearn-practice-site` app running locally at `http://localhost:3000`
- Comfortable with `getByTestId`, `expect`, and basic Playwright actions
 
## Test Cases
 
### Test 1 — Date Picker: Native Date Input
1. Go to the **Date Picker** page.
2. Enter a date into the native date input field.
3. Verify the "Selected date" output on the page correctly displays the date you entered.
 
### Test 2 — Table: Add a User
1. Go to the **Table** page.
2. Add a new user named **Nila** (fill in any other required fields).
3. Verify **Nila** now appears in the users table.
 
### Test 3 — Reorder a Kanban Card
1. Go to the **Drag & Drop** page.
2. Drag a card from the **To Do** column into the **In Progress** column.
3. Verify the card no longer appears in **To Do** and now appears in **In Progress**.
 
### Test 4 — Calendar: Add and Delete an Event
1. Go to the **Calendar** page.
2. Select a future date and add an event to it.
3. Verify the event appears on the correct date.
4. Delete the event.
5. Verify the event no longer appears on that date.
 
### Test 5 — Frames & Windows: Message in Embedded Frame
1. Go to the **Frames & Windows** page.
2. Inside the embedded frame, type a message and click the button to display it.
3. Verify the displayed message matches the text you typed.
 
### Test 6 — Frames & Windows: Open in New Tab
1. Go to the **Frames & Windows** page.
2. Click the link that opens content in a new tab.
3. Verify the new tab opens the **Dynamic Content** page, and validate the page heading.
 
## Solutions
Reference solutions live alongside this brief in this same folder (`solution-01-...spec.ts`
through `solution-06-...spec.ts`). Try each test case yourself first — the solutions are an
answer key, not a starting point.