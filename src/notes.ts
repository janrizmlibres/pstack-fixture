import type { Tag } from "./tags";

export type Note = {
	id: number;
	text: string;
	tags: Tag[];
};

export type NoteStore = {
	list(): Note[];
	add(text: string, tags?: Tag[]): Note;
	remove(id: number): boolean;
};

export function createNoteStore(): NoteStore {
	const notes = new Map<number, Note>();
	let lastId = 0;
	const copy = (note: Note): Note => ({ ...note, tags: [...note.tags] });

	return {
		list: () => [...notes.values()].map(copy),
		add(text, tags = []) {
			lastId += 1;
			const note = { id: lastId, text: text.trim(), tags: [...new Set(tags)] };
			notes.set(note.id, note);
			return copy(note);
		},
		remove: (id) => notes.delete(id),
	};
}
