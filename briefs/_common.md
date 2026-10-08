You are a leaf worker in the orchestrate program qa-orch-compact. I am your lead. You take orders from this brief only.

SETUP (do these first, in this order, inside your worktree)
1. git reset --hard fb14c8f
2. git checkout -b orch/qa-orch-compact/<UNIT>
3. /Users/janlibs/.claude/plugins/cache/claude-pstack/pstack/b018e427576e/scripts/heavy -- bun install --frozen-lockfile
4. cp .env.example .env   (the repo's documented setup, from the committed example. Never copy .env from another checkout. If .env.example is missing, stop with BLOCKED: missing .env.example.)

VERIFY (each through the heavy wrapper H=/Users/janlibs/.claude/plugins/cache/claude-pstack/pstack/b018e427576e/scripts/heavy; record each exit code; run unpiped with output to a file, `cmd > out.txt 2>&1; echo "exit $?"`)
- $H -- bun test <TESTFILE>
- $H -- bunx biome check <TESTFILE>
- $H -- bun run typecheck
- Fault check: make the temporary defect named in your unit section in <MODULE>, run `$H -- bun test <TESTFILE>` and confirm your new test fails for the expected reason (quote the failing assertion line), then `git checkout -- <MODULE>` and re-run the test file green. The defect is never committed.
Exit 75 from the wrapper means the machine lock is busy: wait and re-run. A failure already present at fb14c8f in a file you do not own is reported as `foreign failure: <file>`, never fixed.

RULES
- Write only <TESTFILE>. Commit nothing else. No rebase, no force-push, no push of any kind, no PR.
- The test calls the module the way its users do and asserts a literal expected value. It must fail if the subject returned undefined. Match the file's existing style (tabs, describe/test names in plain present tense, no comments).
- Never ask the human. If something blocks you, stop and return BLOCKED with the question and what each answer would change.
- You are a leaf worker: never start a panel, swarm or arena.
- Commit messages: imperative subject, no Co-Authored-By, Generated-with, Claude-Session or any other attribution line, no ticket, PR or URL.
- TIMEBOX 30 minutes. On expiry, return partial findings and stop.

REPORT
1. Commit the test: `git add <TESTFILE> && git commit -m "<subject naming the edge case>"`.
2. Then a final report commit: `git commit --allow-empty` with subject `report: qa-orch-compact <UNIT>`, a body listing status, branch, test commit SHA, each verify command with its exit code, the fault check (defect made, failing assertion quoted, revert confirmed), lock waits, deviations, suggested follow-ups; and exactly one trailer line `Pstack-Status: PASS|ISSUES|BLOCKED`. No other trailer.
3. Return the same report as your final message, plus the report commit SHA and `git log --oneline fb14c8f..HEAD`.

STANDING ORDERS: read /Users/janlibs/dev/pstack-fixture-qa/.claude/pstack/orchestrate/qa-orch-compact/preferences.md and obey every line.
