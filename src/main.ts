import { createApp } from "./app";
import { loadConfig } from "./config";
import { createNoteStore } from "./notes";

export function start(env: Record<string, string | undefined>) {
	const config = loadConfig(env);
	return Bun.serve({
		port: config.port,
		fetch: createApp({ token: config.token, store: createNoteStore() }),
	});
}

if (import.meta.main) {
	const server = start(process.env);
	console.log(`notes API listening on ${server.url}`);
}
