import { describe, expect, test } from "bun:test";
import { createNoteStore } from "./notes";

describe("note store", () => {
	test("starts empty", () => {
		expect(createNoteStore().list()).toEqual([]);
	});

	test("adds notes with increasing ids, in order", () => {
		const store = createNoteStore();
		store.add("first");
		store.add("second");
		expect(store.list()).toEqual([
			{ id: 1, text: "first" },
			{ id: 2, text: "second" },
		]);
	});

	test("trims note text", () => {
		expect(createNoteStore().add("  padded  ")).toEqual({
			id: 1,
			text: "padded",
		});
	});

	test("removes a note by id and reports whether it existed", () => {
		const store = createNoteStore();
		const note = store.add("gone soon");
		expect(store.remove(note.id)).toBe(true);
		expect(store.remove(note.id)).toBe(false);
		expect(store.list()).toEqual([]);
	});

	test("never reuses the id of a removed note", () => {
		const store = createNoteStore();
		store.remove(store.add("one").id);
		expect(store.add("two").id).toBe(2);
	});

	test("clears every note without reusing ids", () => {
		const store = createNoteStore();
		store.add("one");
		store.add("two");
		store.clear();
		expect(store.list()).toEqual([]);
		expect(store.add("three")).toEqual({ id: 3, text: "three" });
		expect(store.list()).toEqual([{ id: 3, text: "three" }]);
	});

	test("hands out copies, so callers cannot edit stored notes", () => {
		const store = createNoteStore();
		store.add("original");
		const [listed] = store.list();
		if (listed) listed.text = "edited";
		expect(store.list()[0]?.text).toBe("original");
	});
});
