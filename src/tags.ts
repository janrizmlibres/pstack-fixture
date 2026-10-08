export type Tag = string & { readonly __brand: "Tag" };

export function parseTags(raw: unknown): Tag[] | undefined {
	if (raw === undefined) return [];
	if (!Array.isArray(raw)) return undefined;
	const tags: Tag[] = [];
	for (const entry of raw) {
		if (typeof entry !== "string" || !/^[a-z0-9-]{1,32}$/i.test(entry))
			return undefined;
		tags.push(entry.toLowerCase() as Tag);
	}
	return tags;
}
