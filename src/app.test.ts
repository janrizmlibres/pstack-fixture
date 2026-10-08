import { beforeEach, describe, expect, test } from "bun:test";
import { createApp } from "./app";
import { createNoteStore, type NoteStore } from "./notes";

const token = "test-token";
const base = "http://localhost";

let store: NoteStore;
let app: (request: Request) => Promise<Response>;

beforeEach(() => {
	store = createNoteStore();
	app = createApp({ token, store });
});

function call(
	method: string,
	path: string,
	init: { body?: unknown; auth?: string | null } = {},
) {
	const headers = new Headers();
	const auth = init.auth === undefined ? `Bearer ${token}` : init.auth;
	if (auth !== null) headers.set("authorization", auth);
	let body: string | undefined;
	if (init.body !== undefined) {
		headers.set("content-type", "application/json");
		body = JSON.stringify(init.body);
	}
	return app(new Request(`${base}${path}`, { method, headers, body }));
}

describe("health", () => {
	test("answers without a token", async () => {
		const response = await call("GET", "/health", { auth: null });
		expect(response.status).toBe(200);
		expect(await response.text()).toBe("ok");
	});
});

describe("auth", () => {
	test("refuses a request without a token", async () => {
		expect((await call("GET", "/notes", { auth: null })).status).toBe(401);
	});

	test("refuses a wrong token", async () => {
		expect((await call("GET", "/notes", { auth: "Bearer nope" })).status).toBe(
			401,
		);
	});
});

describe("notes", () => {
	test("lists stored notes", async () => {
		store.add("hello");
		const response = await call("GET", "/notes");
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual([{ id: 1, text: "hello" }]);
	});

	test("creates a note", async () => {
		const response = await call("POST", "/notes", {
			body: { text: "buy milk" },
		});
		expect(response.status).toBe(201);
		expect(await response.json()).toEqual({ id: 1, text: "buy milk" });
		expect(store.list()).toEqual([{ id: 1, text: "buy milk" }]);
	});

	test.each([{}, { text: "" }, { text: "   " }, { text: 7 }])(
		"refuses note body %p",
		async (body) => {
			const response = await call("POST", "/notes", { body });
			expect(response.status).toBe(400);
			expect(await response.json()).toEqual({
				error: "text must be a non-empty string",
			});
		},
	);

	test("refuses a body that is not JSON", async () => {
		const response = await app(
			new Request(`${base}/notes`, {
				method: "POST",
				headers: { authorization: `Bearer ${token}` },
				body: "not json",
			}),
		);
		expect(response.status).toBe(400);
	});

	test("deletes a note with an empty 204", async () => {
		const note = store.add("bye");
		const response = await call("DELETE", `/notes/${note.id}`);
		expect(response.status).toBe(204);
		expect(await response.text()).toBe("");
		expect(store.list()).toEqual([]);
	});

	test("answers 404 for a note that does not exist", async () => {
		expect((await call("DELETE", "/notes/99")).status).toBe(404);
	});

	test("answers 404 for an id that is not a number", async () => {
		expect((await call("DELETE", "/notes/abc")).status).toBe(404);
	});
});

describe("note search", () => {
	test("returns matching notes case-insensitively, like the list", async () => {
		store.add("Buy MILK");
		store.add("walk the dog");
		store.add("oat milk latte");
		const response = await call("GET", "/notes/search?q=Milk");
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual([
			{ id: 1, text: "Buy MILK" },
			{ id: 3, text: "oat milk latte" },
		]);
	});

	test("matches q as given, spaces included", async () => {
		store.add("buy milk");
		store.add("buyer");
		const response = await call("GET", "/notes/search?q=buy%20");
		expect(await response.json()).toEqual([{ id: 1, text: "buy milk" }]);
	});

	test("answers an empty array when nothing matches", async () => {
		store.add("hello");
		const response = await call("GET", "/notes/search?q=bye");
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual([]);
	});

	test.each(["", "?q=", "?q=%20%20", "?other=milk"])(
		"refuses search query %p",
		async (query) => {
			store.add("milk");
			const response = await call("GET", `/notes/search${query}`);
			expect(response.status).toBe(400);
			expect(await response.json()).toEqual({
				error: "q must be a non-empty string",
			});
		},
	);

	test("refuses a request without a token", async () => {
		const response = await call("GET", "/notes/search?q=milk", { auth: null });
		expect(response.status).toBe(401);
	});

	test.each(["POST", "DELETE"])("answers 405 for %s", async (method) => {
		const response = await call(method, "/notes/search?q=milk");
		expect(response.status).toBe(405);
		expect(await response.json()).toEqual({ error: "method not allowed" });
	});
});

test("answers 404 for an unknown route", async () => {
	expect((await call("GET", "/nowhere")).status).toBe(404);
});

test("answers 405 for a known path with the wrong method", async () => {
	expect((await call("PUT", "/notes")).status).toBe(405);
});
