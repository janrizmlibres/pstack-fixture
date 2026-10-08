import { describe, expect, test } from "bun:test";
import { parseTags } from "./tags";

describe("parseTags", () => {
	test("reads no tags as an empty list", () => {
		expect(parseTags(undefined)).toEqual([]);
	});

	test("lower-cases each tag", () => {
		expect<string[] | undefined>(parseTags(["Work", "Q3-plan"])).toEqual([
			"work",
			"q3-plan",
		]);
	});

	test("accepts a 32-character tag", () => {
		expect<string[] | undefined>(parseTags(["a".repeat(32)])).toEqual([
			"a".repeat(32),
		]);
	});

	test.each([
		["a 33-character tag", ["a".repeat(33)]],
		["an empty string", [""]],
		["a space", ["a b"]],
		["a non-ASCII letter", ["café"]],
		["a non-string entry", [1]],
		["a non-array value", "work"],
		["null", null],
	])("refuses %s", (_, raw) => {
		expect(parseTags(raw)).toBeUndefined();
	});
});
