import { describe, expect, test } from "bun:test";
import { cloneWithBranches, git, run } from "./git-fixture";

function report(clone: string, branch: string, trailers: string[]) {
	git(clone, "switch", "-q", branch);
	const args = trailers.flatMap((trailer) => ["--trailer", trailer]);
	git(clone, "commit", "-q", "--allow-empty", "-m", "QA report", ...args);
	git(clone, "push", "-q", "origin", branch);
	git(clone, "switch", "-q", "main");
}

describe("qa-results", () => {
	test("prints one row per report, sorted by check", () => {
		const { clone } = cloneWithBranches([
			"claude/landing-heron-k4xs96",
			"qa/entry-cloud",
			"claude/unrelated-work",
			"feature/x",
		]);
		report(clone, "claude/landing-heron-k4xs96", [
			"QA-Check: landing",
			"QA-Result: PASS",
			"Claude-Session: https://claude.ai/code/session_01",
		]);
		report(clone, "qa/entry-cloud", [
			"QA-Check: entry-cloud",
			"QA-Result: FAIL",
			"Claude-Session: https://claude.ai/code/session_02",
		]);
		report(clone, "feature/x", ["QA-Check: ignored", "QA-Result: PASS"]);

		const result = run(clone, "qa-results.sh");

		expect(result.exitCode).toBe(0);
		expect(result.stdout).toBe(
			[
				"entry-cloud\tFAIL\tqa/entry-cloud\thttps://claude.ai/code/session_02",
				"landing\tPASS\tclaude/landing-heron-k4xs96\thttps://claude.ai/code/session_01",
				"",
			].join("\n"),
		);
	});

	test("marks a report missing its result or session", () => {
		const { clone } = cloneWithBranches(["claude/half-done"]);
		report(clone, "claude/half-done", ["QA-Check: lock-busy"]);

		expect(run(clone, "qa-results.sh").stdout).toBe(
			"lock-busy\t?\tclaude/half-done\t?\n",
		);
	});

	test("says so when no branch carries a report", () => {
		const { clone } = cloneWithBranches(["claude/unrelated-work"]);

		const result = run(clone, "qa-results.sh");

		expect(result.exitCode).toBe(0);
		expect(result.stderr).toContain("qa-results: no reports on origin");
		expect(result.stdout).toBe("");
	});
});
