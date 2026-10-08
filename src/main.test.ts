import { expect, test } from "bun:test";
import { start } from "./main";

// Reads the real environment, so the suite fails here when .env is missing.
test("serves the app from the environment", async () => {
	const server = start({ ...process.env, PORT: "0" });
	try {
		const response = await fetch(new URL("/health", server.url));
		expect(await response.text()).toBe("ok");
	} finally {
		await server.stop(true);
	}
});
