import type { NoteStore } from "./notes";

type AppOptions = {
	token: string;
	store: NoteStore;
};

export function createApp({ token, store }: AppOptions) {
	return async (request: Request): Promise<Response> => {
		const { pathname } = new URL(request.url);

		if (pathname === "/health") return new Response("ok");
		if (pathname !== "/notes" && !pathname.startsWith("/notes/"))
			return error(404, "not found");

		if (request.headers.get("authorization") !== `Bearer ${token}`) {
			return error(401, "unauthorized");
		}

		if (pathname === "/notes") {
			if (request.method === "GET") return Response.json(store.list());
			if (request.method === "POST") {
				const text = await readText(request);
				if (text === undefined) {
					return error(400, "text must be a non-empty string");
				}
				return Response.json(store.add(text), { status: 201 });
			}
			return error(405, "method not allowed");
		}

		const id = pathname.match(/^\/notes\/(\d+)$/)?.[1];
		if (id === undefined) return error(404, "not found");
		const noteId = Number(id);
		if (request.method === "GET") {
			const note = store.get(noteId);
			if (note) return Response.json(note);
		}
		if (request.method === "DELETE" && store.remove(noteId)) {
			return new Response(null, { status: 204 });
		}
		return error(404, "not found");
	};
}

async function readText(request: Request): Promise<string | undefined> {
	const body: unknown = await request.json().catch(() => undefined);
	if (typeof body !== "object" || body === null || !("text" in body))
		return undefined;
	const { text } = body;
	return typeof text === "string" && text.trim() !== "" ? text : undefined;
}

function error(status: number, message: string) {
	return Response.json({ error: message }, { status });
}
