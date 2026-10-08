export type Note = {
	id: number;
	text: string;
};

export type NoteStore = {
	list(): Note[];
	add(text: string): Note;
	remove(id: number): boolean;
	clear(): void;
};

export function createNoteStore(): NoteStore {
	const notes = new Map<number, Note>();
	let lastId = 0;

	return {
		list: () => [...notes.values()].map((note) => ({ ...note })),
		add(text) {
			lastId += 1;
			const note = { id: lastId, text: text.trim() };
			notes.set(note.id, note);
			return { ...note };
		},
		remove: (id) => notes.delete(id),
		clear: () => notes.clear(),
	};
}
