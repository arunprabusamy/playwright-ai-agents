---
description: Ensure the HourToLearn AUT (demo app) is running at localhost:3000, starting it if it isn't
---

Check on and, if needed, start the AUT (application under test) that this repo's Playwright tests
target — "HourToLearn", expected at `http://localhost:3000/`. It lives in a separate repo, not this one:

- App path: `C:\Users\aaare\WorkSpace-Udemy-Course\008-Playwright\hourtolearn-practice-site`
- Start command: `npm start`

Steps:

1. **Check if it's already running.** Request `http://localhost:3000/` with a short timeout, e.g.
   `curl -s -o /dev/null -w "%{http_code}" --max-time 3 http://localhost:3000/`.
   - If the request connects and returns an HTTP status code, the app is already running.
     Report that to the user and **stop** — do not start a second instance.
2. **If the connection fails** (refused/timed out), start it:
   - In the app path above, run `npm start` in the **background** (`run_in_background: true`) —
     it's a long-running dev server and would otherwise block.
3. **Wait for it to come up.** Poll `http://localhost:3000/` every few seconds (short Bash calls, or
   the Monitor tool's until-loop — never a blocking `sleep`) for up to ~60 seconds.
4. **Report the outcome** to the user:
   - Already running → say so and skip starting it.
   - Started fresh → confirm once the poll succeeds, and mention it's now running in the background
     for the rest of the session.
   - Didn't come up in time → show the captured background output and report the failure.
</content>
