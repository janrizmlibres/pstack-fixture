export type Config = {
	port: number;
	token: string;
};

export function loadConfig(env: Record<string, string | undefined>): Config {
	const token = env.NOTES_API_TOKEN?.trim();
	if (!token) {
		throw new Error("NOTES_API_TOKEN is not set: copy .env.example to .env");
	}
	return { port: parsePort(env.PORT ?? "3000"), token };
}

function parsePort(raw: string): number {
	const port = Number(raw);
	if (!/^\d+$/.test(raw) || port > 65535) {
		throw new Error(`PORT must be an integer from 0 to 65535, got "${raw}"`);
	}
	return port;
}
