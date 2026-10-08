UNIT notes. MODULE src/notes.ts. TESTFILE src/notes.test.ts.
GOAL: src/notes.test.ts proves removing a note from the middle leaves the other notes listed, in their original order.
WHY THIS CASE: the removal tests only ever hold one note, so a remove that cleared the store or a list that lost insertion order after a delete would pass the suite today.
ACCEPTANCE: one new test inside describe("note store"): add "a", "b", "c"; remove the id of "b" (asserting it returns true); assert `store.list()` toEqual `[{ id: 1, text: "a" }, { id: 3, text: "c" }]`. Existing tests unchanged.
FAULT CHECK DEFECT: change `remove: (id) => notes.delete(id)` to `remove: (id) => { const had = notes.has(id); notes.clear(); return had; }` in src/notes.ts.
