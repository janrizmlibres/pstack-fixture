import type { NoteStore } from "./notes";
import { parseTags } from "./tags";

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
				const body = await readBody(request);
				const text = readText(body);
				if (text === undefined) {
					return error(400, "text must be a non-empty string");
				}
				const tags = parseTags("tags" in body ? body.tags : undefined);
				if (tags === undefined) {
					return error(400, "tags must be a list of 1-32 character words");
				}
				return Response.json(store.add(text, tags), { status: 201 });
			}
			return error(405, "method not allowed");
		}

		const id = pathname.match(/^\/notes\/(\d+)$/)?.[1];
		if (
			id !== undefined &&
			request.method === "DELETE" &&
			store.remove(Number(id))
		) {
			return new Response(null, { status: 204 });
		}
		return error(404, "not found");
	};
}

async function readBody(request: Request): Promise<object> {
	const body: unknown = await request.json().catch(() => undefined);
	return typeof body === "object" && body !== null ? body : {};
}

function readText(body: object): string | undefined {
	if (!("text" in body)) return undefined;
	const { text } = body;
	return typeof text === "string" && text.trim() !== "" ? text : undefined;
}

function error(status: number, message: string) {
	return Response.json({ error: message }, { status });
}
