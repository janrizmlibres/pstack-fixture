UNIT config. MODULE src/config.ts. TESTFILE src/config.test.ts.
GOAL: src/config.test.ts proves loadConfig accepts the top of the port range: PORT "65535" loads as the number 65535.
WHY THIS CASE: the suite covers port 0 and refuses "65536", but no test pins that 65535 itself is accepted, so an off-by-one (`port >= 65535`) would pass the suite today.
ACCEPTANCE: one new test inside the existing describe("loadConfig") block, e.g. test("accepts port 65535, the top of the range", ...) asserting `loadConfig({ PORT: "65535", NOTES_API_TOKEN: "secret" }).port` toBe 65535. Existing tests unchanged.
FAULT CHECK DEFECT: change `port > 65535` to `port >= 65535` in src/config.ts.
