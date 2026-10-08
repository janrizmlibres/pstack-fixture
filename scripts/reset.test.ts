import { describe, expect, test } from "bun:test";
import {
	cloneWithBranches,
	git,
	localBranches,
	remoteBranches,
	run,
} from "./git-fixture";

const kept = ["develop", "gated", "feature/qa/notes", "claudette"];
const deleted = ["qa/landing", "qa/swarm/run-1", "claude/landing-heron-k4xs96"];

describe("reset", () => {
	test("deletes the qa/* and claude/* branches on origin and keeps the rest", () => {
		const { origin, clone } = cloneWithBranches([...kept, ...deleted]);

		const result = run(clone, "reset.sh");

		expect(result.exitCode).toBe(0);
		expect(remoteBranches(origin).sort()).toEqual(["main", ...kept].sort());
		for (const branch of deleted) expect(result.stdout).toContain(branch);
	});

	test("deletes the matching local branches too", () => {
		const { clone } = cloneWithBranches([...kept, ...deleted]);
		git(clone, "branch", "qa/local-only", "main");

		expect(run(clone, "reset.sh").exitCode).toBe(0);

		expect(localBranches(clone).sort()).toEqual(["main", ...kept].sort());
	});

	test("lists what it would delete and deletes nothing with --dry-run", () => {
		const { origin, clone } = cloneWithBranches([...kept, ...deleted]);

		const result = run(clone, "reset.sh", "--dry-run");

		expect(result.exitCode).toBe(0);
		for (const branch of deleted) expect(result.stdout).toContain(branch);
		expect(remoteBranches(origin).sort()).toEqual(
			["main", ...kept, ...deleted].sort(),
		);
		expect(localBranches(clone)).toContain("qa/landing");
	});

	test("refuses to run from a branch it would delete, and deletes nothing", () => {
		const { origin, clone } = cloneWithBranches(deleted);
		git(clone, "switch", "-q", "qa/landing");

		const result = run(clone, "reset.sh");

		expect(result.exitCode).toBe(1);
		expect(result.stderr).toContain("switch off qa/landing first");
		expect(remoteBranches(origin).sort()).toEqual(["main", ...deleted].sort());
	});

	test("says so when there is nothing to delete", () => {
		const { clone } = cloneWithBranches(kept);

		const result = run(clone, "reset.sh");

		expect(result.exitCode).toBe(0);
		expect(result.stdout).toContain("nothing to delete");
	});

	test("refuses an unknown argument", () => {
		const { clone } = cloneWithBranches([]);

		const result = run(clone, "reset.sh", "--force");

		expect(result.exitCode).toBe(2);
		expect(result.stderr).toContain("usage: scripts/reset.sh [--dry-run]");
	});
});
