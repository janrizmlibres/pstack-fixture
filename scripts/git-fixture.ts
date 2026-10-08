import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const scriptsDir = import.meta.dir;

export function git(cwd: string, ...args: string[]): string {
	const result = Bun.spawnSync(["git", ...args], { cwd, stderr: "pipe" });
	if (result.exitCode !== 0) {
		throw new Error(
			`git ${args.join(" ")} failed: ${result.stderr.toString()}`,
		);
	}
	return result.stdout.toString().trim();
}

export function run(cwd: string, script: string, ...args: string[]) {
	const result = Bun.spawnSync(["bash", join(scriptsDir, script), ...args], {
		cwd,
		stderr: "pipe",
	});
	return {
		exitCode: result.exitCode,
		stdout: result.stdout.toString(),
		stderr: result.stderr.toString(),
	};
}

// A clone of a bare origin holding `main` and the given branches, each one commit past main.
export function cloneWithBranches(branches: string[]) {
	const root = mkdtempSync(join(tmpdir(), "pstack-fixture-"));
	const origin = join(root, "origin.git");
	const clone = join(root, "clone");
	git(root, "init", "-q", "--bare", "-b", "main", origin);
	git(root, "clone", "-q", origin, clone);
	git(clone, "config", "user.email", "qa@example.com");
	git(clone, "config", "user.name", "QA");
	git(clone, "commit", "-q", "--allow-empty", "-m", "base");
	git(clone, "push", "-q", "origin", "main");
	for (const branch of branches) {
		git(clone, "switch", "-q", "-c", branch, "main");
		git(clone, "commit", "-q", "--allow-empty", "-m", `on ${branch}`);
		git(clone, "push", "-q", "origin", branch);
	}
	git(clone, "switch", "-q", "main");
	return { root, origin, clone };
}

// The branches of a repo: the bare origin's, or a clone's own.
export function branchesOf(repo: string): string[] {
	return git(
		repo,
		"for-each-ref",
		"--format=%(refname:short)",
		"refs/heads",
	).split("\n");
}
