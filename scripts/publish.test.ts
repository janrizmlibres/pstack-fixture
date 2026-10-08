import { describe, expect, test } from "bun:test";
import {
	chmodSync,
	cpSync,
	mkdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { branchesOf, cloneWithBranches, git, scriptsDir } from "./git-fixture";

const repo = "janrizmlibres/pstack-fixture";

// A stand-in for gh that keeps the repo, rulesets and issues in a state directory.
const stubGh = `#!/usr/bin/env bash
set -euo pipefail
state="$GH_STATE"
echo "gh $*" >> "$state/log"
case "$1 $2" in
  "repo view") [[ -f "$state/repo" ]] ;;
  "repo create") echo "$*" > "$state/repo" ;;
  "issue list") cat "$state/issues" 2>/dev/null || true ;;
  "issue view") touch "$state/comments"; grep -c "^comment $3$" "$state/comments" || true ;;
  "issue comment")
    if [[ -f "$state/fail-comment" ]]; then rm "$state/fail-comment"; exit 1; fi
    echo "comment $3" >> "$state/comments"; cat >> "$state/comments" ;;
  "issue create")
    touch "$state/issues"
    number=$(( $(wc -l < "$state/issues") + 1 ))
    while [[ $# -gt 0 ]]; do
      case "$1" in
        --title) printf '%s\t%s\n' "$number" "$2" >> "$state/issues"; shift ;;
        --body-file) cat > "$state/issue-body" ;;
      esac
      shift
    done
    echo "https://github.com/janrizmlibres/pstack-fixture/issues/$number" ;;
  *)
    if [[ "$1" != api ]]; then echo "stub gh: unexpected $*" >&2; exit 9; fi
    method=GET input=""
    while [[ $# -gt 0 ]]; do
      case "$1" in
        --method) method="$2"; shift ;;
        --input) input="$2"; shift ;;
        repos/*) path="$1" ;;
      esac
      shift
    done
    if [[ "$method" == GET ]]; then cat "$state/rulesets" 2>/dev/null || true; exit 0; fi
    name=$(sed -n 's/.*"name": *"\\([^"]*\\)".*/\\1/p' "$input" | head -1)
    echo "$method $path $name" >> "$state/ruleset-writes"
    if [[ "$method" == POST ]]; then
      touch "$state/rulesets"
      id=$(( $(wc -l < "$state/rulesets") + 100 ))
      printf '%s\\t%s\\n' "$id" "$name" >> "$state/rulesets"
    fi ;;
esac
`;

function setup(branches = ["develop", "gated"]) {
	const fixture = cloneWithBranches(branches);
	const bin = join(fixture.root, "bin");
	const state = join(fixture.root, "gh-state");
	mkdirSync(bin);
	mkdirSync(state);
	writeFileSync(join(bin, "gh"), stubGh);
	chmodSync(join(bin, "gh"), 0o755);
	for (const branch of branches)
		git(fixture.clone, "branch", "-q", "-f", branch, "main");

	mkdirSync(join(fixture.clone, "qa"));
	writeFileSync(
		join(fixture.clone, "qa", "spec-issue.md"),
		"# Spec: Tag notes\n\n## Problem Statement\n\nNotes have no tags.\n",
	);
	writeFileSync(
		join(fixture.clone, "qa", "spec-comment.md"),
		"Tags are case-insensitive.\n",
	);
	cpSync(
		join(scriptsDir, "..", ".github", "rulesets"),
		join(fixture.clone, ".github", "rulesets"),
		{
			recursive: true,
		},
	);

	// Start from an origin that has none of the branches yet, as a new GitHub repo does.
	for (const branch of branches)
		git(fixture.clone, "push", "-q", "origin", "--delete", branch);
	return { ...fixture, bin, state };
}

function publish(env: { clone: string; bin: string; state: string }) {
	const result = Bun.spawnSync(["bash", join(scriptsDir, "publish.sh")], {
		cwd: env.clone,
		env: {
			...process.env,
			PATH: `${env.bin}:${process.env.PATH}`,
			GH_STATE: env.state,
		},
		stderr: "pipe",
	});
	return { exitCode: result.exitCode, stderr: result.stderr.toString() };
}

const read = (path: string) => readFileSync(path, "utf8");

describe("publish", () => {
	test("creates the public repo, pushes the branches, applies the rulesets and files the spec", () => {
		const env = setup();

		const result = publish(env);

		expect(result.stderr).toBe("");
		expect(result.exitCode).toBe(0);
		expect(read(join(env.state, "repo"))).toContain(
			`repo create ${repo} --public`,
		);
		expect(branchesOf(env.origin).sort()).toEqual(["develop", "gated", "main"]);
		expect(read(join(env.state, "ruleset-writes"))).toBe(
			[
				`POST repos/${repo}/rulesets gated`,
				`POST repos/${repo}/rulesets main`,
				"",
			].join("\n"),
		);
		expect(read(join(env.state, "issues"))).toBe("1\tSpec: Tag notes\n");
		expect(read(join(env.state, "issue-body"))).toBe(
			"## Problem Statement\n\nNotes have no tags.\n",
		);
		expect(read(join(env.state, "comments"))).toBe(
			"comment 1\nTags are case-insensitive.\n",
		);
	});

	test("on a second run creates nothing and updates the rulesets in place", () => {
		const env = setup();
		publish(env);
		writeFileSync(join(env.state, "ruleset-writes"), "");

		const result = publish(env);

		expect(result.exitCode).toBe(0);
		expect(read(join(env.state, "log")).match(/repo create/g)).toHaveLength(1);
		expect(read(join(env.state, "ruleset-writes"))).toBe(
			[
				`PUT repos/${repo}/rulesets/100 gated`,
				`PUT repos/${repo}/rulesets/101 main`,
				"",
			].join("\n"),
		);
		expect(read(join(env.state, "issues"))).toBe("1\tSpec: Tag notes\n");
		expect(read(join(env.state, "comments")).match(/^comment /gm)).toHaveLength(
			1,
		);
	});

	test("posts the spec comment on a re-run when the first run filed the issue but not the comment", () => {
		const env = setup();
		writeFileSync(join(env.state, "fail-comment"), "");
		expect(publish(env).exitCode).not.toBe(0);

		expect(publish(env).exitCode).toBe(0);

		expect(read(join(env.state, "issues"))).toBe("1\tSpec: Tag notes\n");
		expect(read(join(env.state, "comments"))).toBe(
			"comment 1\nTags are case-insensitive.\n",
		);
	});

	test("leaves a branch alone once origin has it", () => {
		const env = setup();
		publish(env);
		git(env.clone, "switch", "-q", "develop");
		git(env.clone, "commit", "-q", "--allow-empty", "-m", "local only");

		expect(publish(env).exitCode).toBe(0);

		expect(git(env.origin, "rev-parse", "develop")).toBe(
			git(env.clone, "rev-parse", "main"),
		);
	});

	test("refuses to publish without every fixture branch, and creates nothing", () => {
		const env = setup(["develop"]);

		const result = publish(env);

		expect(result.exitCode).toBe(1);
		expect(result.stderr).toContain("publish: missing local branch gated");
		expect(() => read(join(env.state, "log"))).toThrow();
	});
});
