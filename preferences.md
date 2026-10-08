1. Local only: every unit runs as a same-session Agent on the work agent with isolation worktree. No cloud workers, no create_session.
2. Push nothing except the store branch pstack/orchestrate/qa-orch-compact. Workers push nothing at all.
3. Open no PRs, merge nothing, land nothing. No landing grant: finished units stop at done on their own local branch.
4. One unit per module, one writer per branch: unit app writes only src/app.test.ts, unit config only src/config.test.ts, unit notes only src/notes.test.ts. Production code under src/ is never edited.
5. Each unit adds exactly one test for an edge case the module's suite does not cover yet, and commits it on branch orch/qa-orch-compact/<unit> created from start commit fb14c8f.
6. Verification bar: the unit's own test file passes, Biome passes on it, typecheck passes, and the new test is shown to fail against a temporary deliberate defect in the module that is then reverted (never committed). Self-reported verdict is unit-test-verified.
7. Heavy commands (bun install, bun test, biome, tsc) run through /Users/janlibs/.claude/plugins/cache/claude-pstack/pstack/b018e427576e/scripts/heavy -- <cmd>, test runs scoped to the unit's own test file.
8. Commit messages carry no Co-Authored-By, Generated-with, Claude-Session or other attribution line, and cite no ticket, PR or URL.
9. No rebase, no force-push, no edits outside the unit's file, never ask the human: return BLOCKED with the question instead.
10. Clarifies 4 and 6: the deliberate defect is a temporary working-tree edit to the module, reverted with git checkout before committing; the committed diff touches only the unit's test file.
