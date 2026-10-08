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
		expect(await response.json()).toEqual([{ id: 1, text: "hello", tags: [] }]);
	});

	test("creates a note", async () => {
		const response = await call("POST", "/notes", {
			body: { text: "buy milk" },
		});
		expect(response.status).toBe(201);
		expect(await response.json()).toEqual({
			id: 1,
			text: "buy milk",
			tags: [],
		});
		expect(store.list()).toEqual([{ id: 1, text: "buy milk", tags: [] }]);
	});

	test("creates a note with tags", async () => {
		const response = await call("POST", "/notes", {
			body: { text: "plan", tags: ["work", "q3"] },
		});
		expect(response.status).toBe(201);
		expect(await response.json()).toEqual({
			id: 1,
			text: "plan",
			tags: ["work", "q3"],
		});
		expect<unknown>(store.list()).toEqual([
			{ id: 1, text: "plan", tags: ["work", "q3"] },
		]);
	});

	test("stores mixed-case duplicates as one lower-case tag", async () => {
		const response = await call("POST", "/notes", {
			body: { text: "plan", tags: ["Work", "work", "q3", "WORK"] },
		});
		expect(response.status).toBe(201);
		expect(await response.json()).toEqual({
			id: 1,
			text: "plan",
			tags: ["work", "q3"],
		});
	});

	test.each([
		"work",
		null,
		[1],
		[""],
		["no spaces"],
		["café"],
		["a".repeat(33)],
	])("refuses tags %p", async (tags) => {
		const response = await call("POST", "/notes", {
			body: { text: "bad", tags },
		});
		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({
			error: "tags must be a list of 1-32 character words",
		});
		expect(store.list()).toEqual([]);
	});

	test("checks text before tags", async () => {
		const response = await call("POST", "/notes", {
			body: { text: "", tags: ["no spaces"] },
		});
		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({
			error: "text must be a non-empty string",
		});
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

describe("notes filtered by tag", () => {
	beforeEach(async () => {
		await call("POST", "/notes", { body: { text: "one", tags: ["work"] } });
		await call("POST", "/notes", { body: { text: "two", tags: ["home"] } });
		await call("POST", "/notes", {
			body: { text: "three", tags: ["work", "q3"] },
		});
	});

	test.each(["work", "WORK", "Work"])(
		"lists only the notes tagged %p",
		async (tag) => {
			const response = await call("GET", `/notes?tag=${tag}`);
			expect(response.status).toBe(200);
			expect(await response.json()).toEqual([
				{ id: 1, text: "one", tags: ["work"] },
				{ id: 3, text: "three", tags: ["work", "q3"] },
			]);
		},
	);

	test("lists nothing for a tag no note carries", async () => {
		const response = await call("GET", "/notes?tag=nobody");
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual([]);
	});

	test("lists every note without a tag filter", async () => {
		const response = await call("GET", "/notes");
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual([
			{ id: 1, text: "one", tags: ["work"] },
			{ id: 2, text: "two", tags: ["home"] },
			{ id: 3, text: "three", tags: ["work", "q3"] },
		]);
	});

	test.each([
		"tag=",
		"tag",
		"tag=a%20b",
		"tag=caf%C3%A9",
		`tag=${"a".repeat(33)}`,
		"tag=work&tag=home",
	])("refuses the filter ?%s", async (query) => {
		const response = await call("GET", `/notes?${query}`);
		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({
			error: "tag must be a 1-32 character word",
		});
	});
});

test("answers 404 for an unknown route", async () => {
	expect((await call("GET", "/nowhere")).status).toBe(404);
});

test("answers 405 for a known path with the wrong method", async () => {
	expect((await call("PUT", "/notes")).status).toBe(405);
});
