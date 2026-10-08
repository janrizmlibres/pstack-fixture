export type Tag = string & { readonly __brand: "Tag" };

export function parseTag(raw: string): Tag | undefined {
	return /^[a-z0-9-]{1,32}$/i.test(raw)
		? (raw.toLowerCase() as Tag)
		: undefined;
}

export function parseTags(raw: unknown): Tag[] | undefined {
	if (raw === undefined) return [];
	if (!Array.isArray(raw)) return undefined;
	const tags: Tag[] = [];
	for (const entry of raw) {
		const tag = typeof entry === "string" ? parseTag(entry) : undefined;
		if (tag === undefined) return undefined;
		tags.push(tag);
	}
	return tags;
}
