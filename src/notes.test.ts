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

	test("hands out copies, so callers cannot edit stored notes", () => {
		const store = createNoteStore();
		store.add("original");
		const [listed] = store.list();
		if (listed) listed.text = "edited";
		expect(store.list()[0]?.text).toBe("original");
	});

	test("searches note text case-insensitively, in order", () => {
		const store = createNoteStore();
		store.add("Buy MILK");
		store.add("walk the dog");
		store.add("oat milk latte");
		expect(store.search("milk")).toEqual([
			{ id: 1, text: "Buy MILK" },
			{ id: 3, text: "oat milk latte" },
		]);
		expect(store.search("Dog")).toEqual([{ id: 2, text: "walk the dog" }]);
		expect(store.search("cheese")).toEqual([]);
	});

	test("hands out search results as copies", () => {
		const store = createNoteStore();
		store.add("original");
		const [found] = store.search("orig");
		if (found) found.text = "edited";
		expect(store.list()[0]?.text).toBe("original");
	});
});
