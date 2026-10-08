import { describe, expect, test } from "bun:test";
import { loadConfig } from "./config";

describe("loadConfig", () => {
	test("reads the port and token", () => {
		expect(loadConfig({ PORT: "4000", NOTES_API_TOKEN: "secret" })).toEqual({
			port: 4000,
			token: "secret",
		});
	});

	test("defaults the port to 3000", () => {
		expect(loadConfig({ NOTES_API_TOKEN: "secret" }).port).toBe(3000);
	});

	test("accepts port 0 for an ephemeral port", () => {
		expect(loadConfig({ PORT: "0", NOTES_API_TOKEN: "secret" }).port).toBe(0);
	});

	test("refuses a missing token and points at .env.example", () => {
		expect(() => loadConfig({ PORT: "3000" })).toThrow(
			"NOTES_API_TOKEN is not set: copy .env.example to .env",
		);
	});

	test("refuses a blank token", () => {
		expect(() => loadConfig({ NOTES_API_TOKEN: "  " })).toThrow(
			"NOTES_API_TOKEN is not set",
		);
	});

	test.each(["abc", "-1", "65536", "3.5"])("refuses port %p", (port) => {
		expect(() => loadConfig({ PORT: port, NOTES_API_TOKEN: "secret" })).toThrow(
			`PORT must be an integer from 0 to 65535, got "${port}"`,
		);
	});
});
