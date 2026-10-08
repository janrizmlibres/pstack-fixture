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
			return notFound();

		if (request.headers.get("authorization") !== `Bearer ${token}`) {
			return Response.json({ error: "unauthorized" }, { status: 401 });
		}

		if (pathname === "/notes") {
			if (request.method === "GET") return Response.json(store.list());
			if (request.method === "POST") {
				const text = await readText(request);
				if (text === undefined) {
					return Response.json(
						{ error: "text must be a non-empty string" },
						{ status: 400 },
					);
				}
				return Response.json(store.add(text), { status: 201 });
			}
			return Response.json({ error: "method not allowed" }, { status: 405 });
		}

		const id = pathname.match(/^\/notes\/(\d+)$/)?.[1];
		if (
			id !== undefined &&
			request.method === "DELETE" &&
			store.remove(Number(id))
		) {
			return new Response(null, { status: 204 });
		}
		return notFound();
	};
}

async function readText(request: Request): Promise<string | undefined> {
	const body: unknown = await request.json().catch(() => undefined);
	if (typeof body !== "object" || body === null || !("text" in body))
		return undefined;
	const { text } = body;
	return typeof text === "string" && text.trim() !== "" ? text : undefined;
}

function notFound() {
	return Response.json({ error: "not found" }, { status: 404 });
}
