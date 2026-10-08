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

	test("gets a stored note by id", () => {
		const store = createNoteStore();
		store.add("first");
		store.add("second");
		expect(store.get(2)).toEqual({ id: 2, text: "second" });
	});

	test("gets nothing for an id that is not stored", () => {
		const store = createNoteStore();
		store.add("only");
		expect(store.get(99)).toBeUndefined();
		expect(store.get(1)).toEqual({ id: 1, text: "only" });
	});

	test("gets a copy, so callers cannot edit the stored note", () => {
		const store = createNoteStore();
		store.add("original");
		const got = store.get(1);
		if (got) got.text = "edited";
		expect(store.get(1)).toEqual({ id: 1, text: "original" });
	});

	test("hands out copies, so callers cannot edit stored notes", () => {
		const store = createNoteStore();
		store.add("original");
		const [listed] = store.list();
		if (listed) listed.text = "edited";
		expect(store.list()[0]?.text).toBe("original");
	});
});
