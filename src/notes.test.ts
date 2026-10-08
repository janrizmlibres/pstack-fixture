import { describe, expect, test } from "bun:test";
import { createNoteStore } from "./notes";
import type { Tag } from "./tags";

const tags = (...names: string[]) => names as Tag[];
const tag = (name: string) => name as Tag;

describe("note store", () => {
	test("starts empty", () => {
		expect(createNoteStore().list()).toEqual([]);
	});

	test("adds notes with increasing ids, in order", () => {
		const store = createNoteStore();
		store.add("first");
		store.add("second");
		expect(store.list()).toEqual([
			{ id: 1, text: "first", tags: [] },
			{ id: 2, text: "second", tags: [] },
		]);
	});

	test("trims note text", () => {
		expect(createNoteStore().add("  padded  ")).toEqual({
			id: 1,
			text: "padded",
			tags: [],
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

	test("stores a note with no tags as an empty list", () => {
		const store = createNoteStore();
		expect(store.add("untagged")).toEqual({
			id: 1,
			text: "untagged",
			tags: [],
		});
		expect(store.list()).toEqual([{ id: 1, text: "untagged", tags: [] }]);
	});

	test("drops repeated tags, keeping the order first given", () => {
		const store = createNoteStore();
		expect(store.add("tagged", tags("b", "a", "b", "a")).tags).toEqual(
			tags("b", "a"),
		);
		expect(store.list()[0]?.tags).toEqual(tags("b", "a"));
	});

	test("hands out tag copies, so callers cannot edit stored tags", () => {
		const store = createNoteStore();
		store.add("tagged", tags("work")).tags.push("added" as Tag);
		store.list()[0]?.tags.push("added" as Tag);
		expect(store.list()[0]?.tags).toEqual(tags("work"));
	});

	describe("filtered by tag", () => {
		function seeded() {
			const store = createNoteStore();
			store.add("one", tags("work"));
			store.add("two", tags("home"));
			store.add("three", tags("work", "q3"));
			return store;
		}

		test("lists only the notes that carry the tag, in id order", () => {
			expect(seeded().list(tag("work"))).toEqual([
				{ id: 1, text: "one", tags: tags("work") },
				{ id: 3, text: "three", tags: tags("work", "q3") },
			]);
		});

		test("lists nothing for a tag no note carries", () => {
			const store = seeded();
			expect(store.list(tag("nobody"))).toEqual([]);
			expect(store.list(tag("home"))).toEqual([
				{ id: 2, text: "two", tags: tags("home") },
			]);
		});

		test("lists every note without a tag", () => {
			expect(
				seeded()
					.list()
					.map((note) => note.id),
			).toEqual([1, 2, 3]);
		});
	});
});
