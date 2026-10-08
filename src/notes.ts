export type Note = {
	id: number;
	text: string;
};

export type NoteStore = {
	list(): Note[];
	search(query: string): Note[];
	add(text: string): Note;
	remove(id: number): boolean;
};

export function createNoteStore(): NoteStore {
	const notes = new Map<number, Note>();
	let lastId = 0;

	return {
		list: () => [...notes.values()].map((note) => ({ ...note })),
		search(query) {
			const needle = query.toLowerCase();
			return [...notes.values()]
				.filter((note) => note.text.toLowerCase().includes(needle))
				.map((note) => ({ ...note }));
		},
		add(text) {
			lastId += 1;
			const note = { id: lastId, text: text.trim() };
			notes.set(note.id, note);
			return { ...note };
		},
		remove: (id) => notes.delete(id),
	};
}
