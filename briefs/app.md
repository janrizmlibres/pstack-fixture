UNIT app. MODULE src/app.ts. TESTFILE src/app.test.ts.
GOAL: src/app.test.ts proves an unknown route answers 404 even without a token, so route matching happens before auth and unknown paths never leak a 401.
WHY THIS CASE: the only unknown-route test sends a valid token, so moving the auth check above the route check would pass the suite today.
ACCEPTANCE: one new test (next to the existing "answers 404 for an unknown route" test, or in it as its own test) that calls `call("GET", "/nowhere", { auth: null })` and asserts status 404 and body `{ error: "not found" }`. Existing tests unchanged.
FAULT CHECK DEFECT: in src/app.ts move the authorization check so it runs before the `/notes` route check (right after the /health line).
