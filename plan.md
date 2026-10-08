# Note tags plan

API callers can tag a note when they create it, list only the notes that carry a tag, rename a tag across every note, and read how many notes carry each tag.
Every note carries a `tags` array from the first PR on, so no response shape ever has two variants.
A tag is one parsed value with one rule, `^[a-z0-9_-]{1,32}$` after trim and lowercase, and every entry point uses the same parser.
Three stacked PRs land in this order.
T1 adds tags on `POST /notes` and the `GET /notes?tag=` filter.
T2 adds `PATCH /tags/:tag` to rename a tag.
T3 adds `GET /tags` with a count per tag.

## How to read this

One box is one unit of work. Every box names the evidence that checks it. A nested box is a sub-step of the box above it. Check a box only when its evidence exists, a file, a log line, a screenshot, a test run, or a SHA. The body is a how-to. The appendices explain and record.

The program runs `${CLAUDE_PLUGIN_ROOT}/skills/poteto-mode/playbooks/autopilot-stack.md`. The request grants no landing, the three PRs are sequenced, and the operator lands the stack bottom-up. No owner merges. T1, T2, and T3 all stop at stack-ready for the operator.

Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

## Program checklist

### Arm the program

- [ ] Start execution only on the go. A spec handed in is the go, as are the operator's explicit go and a go grant in a brief. When the request asked for this plan alone, stop here.
- [ ] Read these at program start. Re-read them at every tick.
  - [ ] `${CLAUDE_PLUGIN_ROOT}/skills/poteto-mode/playbooks/autopilot-stack.md`
  - [ ] `${CLAUDE_PLUGIN_ROOT}/skills/swarm/SKILL.md`
  - [ ] `${CLAUDE_PLUGIN_ROOT}/skills/control-cli/SKILL.md`
  - [ ] `${CLAUDE_PLUGIN_ROOT}/skills/poteto-mode/playbooks/opening-a-pr.md`
  - [ ] `${CLAUDE_PLUGIN_ROOT}/skills/poteto-mode/references/brief-contract.md`
  - [ ] `${CLAUDE_PLUGIN_ROOT}/skills/principle-type-system-discipline/SKILL.md`
  - [ ] `${CLAUDE_PLUGIN_ROOT}/skills/principle-make-operations-idempotent/SKILL.md`
  - [ ] `${CLAUDE_PLUGIN_ROOT}/skills/principle-test-behavior-not-implementation/SKILL.md`
  - [ ] `CLAUDE.md` at the repo root. Its test-first rule and its no-ticket-links rule bind every owner.
- [ ] On the go, arm the audit tick as `/loop 1h` with the tick prompt below, through the Skill tool. In cloud (`pstack: surface=cloud`), run the same cadence from a background wait instead, since a pending loop won't wake a paused VM. Never leave the cadence to memory.
- [ ] Use this tick prompt, verbatim. "Read the poteto-mode skill at ${CLAUDE_PLUGIN_ROOT}/skills/poteto-mode/SKILL.md and re-read the execution playbook. Audit the operation against it and fix drift in this tick. Probe every active lane and judge progress by side effects only. Stand down a stuck lane and dispatch its replacement now. Then post a short status message to the operator in chat only when the audit found a tracked change that no earlier status message reported, such as a PR opened, a code-ready head, a round launched or closed, a verdict, a merge, a stuck agent and the action taken, a blocker added or cleared, or a decision only the operator can make. Name every such change and nothing else. Do not repeat a table, the merged list, or an unchanged blocker. If the audit found none, end the turn with no reply text. Either way, log this tick's row in your decision trail. The row names the items reported, or none."
- [ ] On the operator's hold or stand-down, send every owner a zero-writes order at once.

### Spawn owners

- [ ] Spawn one owner per PR with the full lifecycle the execution playbook names. Each owner's brief follows the brief contract.
- [ ] Follow this dependency graph. Start dependent work only after its parent merges, or base it on the parent branch when the execution playbook stacks.
  - [ ] T1 is first. Branch `tags/1-tag-notes` from `main`.
  - [ ] T2 after T1. Branch `tags/2-rename-tag` from the tip of `tags/1-tag-notes`.
  - [ ] T3 after T1. Branch `tags/3-count-tags` from the tip of `tags/2-rename-tag`, so the stack stays linear. T3 needs no code from T2, but both edit the `/tags` routing in `src/app.ts`.
- [ ] Hold the file boundaries. T1, T2, and T3 touch only `src/notes.ts`, `src/notes.test.ts`, `src/app.ts`, and `src/app.test.ts`. T1 alone may also edit `README.md`.
- [ ] Hold the review gate. None of the three PRs changes an interaction, since the change is an HTTP API with no screen. The operator still reviews the whole stack before landing it.

### PR mechanics, for every PR

- [ ] GitHub CLI (`gh`) is the forge. In cloud (`pstack: surface=cloud`), do the same operation with `gh api` REST.
- [ ] Open the PR ready, never draft, per **Opening a PR**. The operator's global rule asks for GitHub native stacks through the `gh stack` extension. Push the three branches, then run `gh stack link --base main tags/1-tag-notes tags/2-rename-tag tags/3-count-tags`. That command creates any missing PR and the stack object. T1 targets `main`. T2 targets `tags/1-tag-notes`. T3 targets `tags/2-rename-tag`.
- [ ] Run the repo's lint and typecheck once before the PR-facing push. Push with hooks on. Run the CI steps from `.github/workflows/ci.yml` exactly, `bun run lint`, `bun run typecheck`, and `bun test`, and record each exit code.
- [ ] Run `/deslop` (read ${CLAUDE_PLUGIN_ROOT}/skills/deslop/SKILL.md) before each commit and `/no-comments` (read ${CLAUDE_PLUGIN_ROOT}/skills/no-comments/SKILL.md) before review.
- [ ] Triage every comment from review bots (e.g. Claude Code Review, Bugbot, Copilot) and security-review bots per `${CLAUDE_PLUGIN_ROOT}/skills/poteto-mode/references/bugbot-triage.md`.
- [ ] Rebase onto current trunk before the code-ready report and babysit. Keep that merge base in fix rounds. Rebase again only at merge prep, on a `git merge-tree` conflict with trunk, or on a CI failure that comes from a change on trunk. Rebase the whole stack with `gh stack checkout <stack-number>` and then `gh stack sync`.
- [ ] Write commit messages with no attribution lines and no ticket, PR, or URL references.

### Verdict and merge, for every PR

- [ ] At the code-ready head SHA and at each later push that changes the patch, run the swarm per `${CLAUDE_PLUGIN_ROOT}/skills/swarm/SKILL.md`. One gates lane. The ten live lanes from the PR's **Verify, live** block. The perf lane from its **Verify, perf** block. Two or more audit lanes, each with its own focus, that read the diff and the receipts and distrust the PR body. The root audits the receipts in the merge-ready report before the verdict.
- [ ] Clean only when every lane is `PASS`. Findings go back to the owner, including a defect that a lane filed as a note. A new head gets a fresh swarm and a fresh verdict, except for results that stay valid under the patch-id rule in `playbooks/shipping.md`.
- [ ] Append a PR to the stack only on a clean verdict at its exact head SHA. A rebase that leaves `git patch-id --stable` unchanged keeps the verdict. A changed patch-id voids it and sends the PR back through the swarm. The operator lands the stack bottom-up. No owner merges or arms auto-merge.

### Boot recipe, for every live lane

Each live lane runs on its own worker at the PR head, placed as the swarm skill places it. Drive through `control-ui` or `control-cli`.

- [ ] `git fetch origin <head-branch> && git checkout <head SHA>`.
- [ ] Run `bun install --frozen-lockfile` and `cp .env.example .env`. Start the server in tmux with `tmux new-session -d -s lane-<n> "PORT=$((4100 + <n>)) bun run start"`. Poll `tmux capture-pane -pt lane-<n>` until it prints `notes API listening on`.
- [ ] Send requests only with `curl -s -w '\n%{http_code}\n' -H 'authorization: Bearer change-me'` against `http://localhost:$((4100 + <n>))`. The read-only diagnostics are `tmux capture-pane -pt lane-<n>` and `GET /notes`. Kill the session with `tmux kill-session -t lane-<n>` at the end.
- [ ] Save every screenshot to `/tmp/swarm-<pr-id>/worker-<n>/<slug>.png` and return the paths with the report. The API has no screen, so each `<slug>.png` is a rendered image of the lane's terminal transcript, and the plain transcript sits beside it as `<slug>.txt`. The `.txt` file is the evidence the predicate reads.

## Tag notes on create and filter the list by tag (T1)

**Depends on.** None.

**Files.**

- [ ] Edit `src/notes.ts`.
- [ ] Edit `src/notes.test.ts`.
- [ ] Edit `src/app.ts`.
- [ ] Edit `src/app.test.ts`.
- [ ] Edit `README.md` to list the routes and the tag rule.

**Build.**

Work test-first per `CLAUDE.md`. Each box below is one Red, Green, Refactor cycle. Watch the new test fail for the expected reason before you write code.

- [ ] Red, then green. In `src/notes.ts`, add the branded type `Tag` and the function `parseTag(raw: unknown): Tag | undefined`. It trims, lowercases, and accepts only `^[a-z0-9_-]{1,32}$`. The charset keeps a tag safe as a path segment for T2.
- [ ] Red, then green. Change `Note` to `{ id: number; text: string; tags: Tag[] }`. Change `NoteStore.add` to `add(text: string, tags?: Tag[])`. The store drops duplicate tags and keeps the first position of each. `list()` returns copies of the `tags` array too.
- [ ] Red, then green. Change `NoteStore.list` to `list(tag?: Tag)`. With a tag, it returns only the notes that carry that tag, in id order.
- [ ] Red, then green. In `src/app.ts`, extend the body reader so `POST /notes` reads an optional `tags` field. A `tags` value that is not an array, or that holds any entry `parseTag` rejects, answers 400 with `{"error":"tags must be an array of tags matching ^[a-z0-9_-]{1,32}$"}`.
- [ ] Red, then green. `GET /notes?tag=<x>` parses `x` with `parseTag`. An invalid tag answers 400 with `{"error":"tag must match ^[a-z0-9_-]{1,32}$"}`. A valid tag that no note carries answers 200 with `[]`.
- [ ] Update the existing expectations in `src/notes.test.ts` and `src/app.test.ts` that assert `{ id, text }` to include `tags: []`.
- [ ] Refactor. Consider these candidates and record a verdict for each in the PR body. First, replace the two body readers with one `readNoteBody` that returns `{ text, tags }` or an error message. Second, keep the 400 messages in one place. Third, add a tag index in the store in place of a scan. The expected verdict on the index is "keep the scan", since the store is in memory and the perf block sets the budget.

**You see.**

- [ ] `curl -s -X POST localhost:4101/notes -H 'authorization: Bearer change-me' -H 'content-type: application/json' -d '{"text":"buy milk","tags":["Home"," errands ","home"]}'` prints `{"id":1,"text":"buy milk","tags":["home","errands"]}` with status 201.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `src/notes.test.ts` gains cases for `parseTag` (trim, lowercase, each rejected input), duplicate tags, the copy of `tags` on `list()`, and `list(tag)`. Run `bun test src/notes.test.ts`.
- [ ] `src/app.test.ts` gains cases for create with tags, create without tags, each 400 body, the filter, the empty filter result, and the invalid filter. Run `bun test src/app.test.ts`.
- [ ] Run the CI steps, `bun run lint`, `bun run typecheck`, and `bun test`. Each exits 0.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on the `volume` agent at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Run `POST /notes {"text":"a"}`, then `GET /notes`, then `DELETE /notes/1`, at trunk and at head. Trunk lacks tags, so record that trunk answers without a `tags` key, and gate head on the same statuses plus `"tags":[]`. Save `t1-regression.png`. Pass when the statuses are 201, 200, and 204 on both sides and head's bodies add only `"tags":[]`.
- [ ] Lane 2. Create a note with `["Home"," errands ","home"]`. Save `t1-normalize.png`. Pass when the body is `{"id":1,"text":"buy milk","tags":["home","errands"]}`.
- [ ] Lane 3. Create three notes tagged `["work"]`, `["home"]`, and `["work","home"]`, then `GET /notes?tag=work`. Save `t1-filter.png`. Pass when ids 1 and 3 come back in that order.
- [ ] Lane 4. Run `GET /notes?tag=WORK` after lane 3's setup. Save `t1-filter-case.png`. Pass when the result equals lane 3's.
- [ ] Lane 5. Run `GET /notes?tag=nobody` on a store with tagged notes. Save `t1-filter-empty.png`. Pass when the status is 200 and the body is `[]`.
- [ ] Lane 6. Run `GET /notes?tag=a%20b` and `GET /notes?tag=`. Save `t1-filter-invalid.png`. Pass when both answer 400 with `{"error":"tag must match ^[a-z0-9_-]{1,32}$"}`.
- [ ] Lane 7. POST with `"tags":"work"`, `"tags":[7]`, `"tags":["a/b"]`, and a 33-character tag. Save `t1-create-invalid.png`. Pass when all four answer 400 with the tags error and `GET /notes` then returns `[]`.
- [ ] Lane 8. POST with `"tags":[]` and with no `tags` key. Save `t1-create-untagged.png`. Pass when both notes come back with `"tags":[]`.
- [ ] Lane 9. Create a tagged note, delete it, then run `GET /notes?tag=<its tag>`. Save `t1-delete.png`. Pass when the filter returns `[]`.
- [ ] Lane 10. Run `GET /notes?tag=work` with no token. Save `t1-auth.png`. Pass when the status is 401 and the body is `{"error":"unauthorized"}`.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. The p50 and p95 latency of `GET /notes` with 1,000 stored notes, at trunk and at head. Trunk lacks the filter, so head also measures `GET /notes?tag=t7` with 1,000 notes spread across 10 tags.
- [ ] Probe. A Bun script in `/tmp/perf-t1/probe.ts` seeds 1,000 notes through `POST /notes`, then times 500 sequential requests with `performance.now()` and prints p50 and p95. Run it at trunk and head in alternation, three times each, each against a fresh server.
- [ ] Baseline. Record the trunk p50 and p95 of unfiltered `GET /notes` first.
- [ ] Rule. Head fails if its unfiltered p50 exceeds 1.25 times the trunk p50. The filtered request fails if its p50 exceeds 5 ms or its p95 exceeds 15 ms.

**Review gate.** None. T1 is not review-gated.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Review-bot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] The root appends T1 to the base-branch stack and the operator lands it bottom-up.

## Rename a tag across every note (T2)

**Depends on.** T1.

**Files.**

- [ ] Edit `src/notes.ts`.
- [ ] Edit `src/notes.test.ts`.
- [ ] Edit `src/app.ts`.
- [ ] Edit `src/app.test.ts`.

**Build.**

Work test-first per `CLAUDE.md`. Each box below is one Red, Green, Refactor cycle.

- [ ] Red, then green. Add `NoteStore.renameTag(from: Tag, to: Tag): number` in `src/notes.ts`. It replaces `from` with `to` on every note that carries `from` and returns how many notes changed. A note that already carries `to` keeps one copy at the earlier position.
- [ ] Red, then green. In `src/app.ts`, admit `/tags` and `/tags/<segment>` past the 404 guard, behind the same token check. Answer `PATCH /tags/:tag` with body `{"name":"<new>"}`. Parse both tags with `parseTag`. Answer 200 with `{"tag":"<new>","notes":<count>}`.
- [ ] Red, then green. An unknown source tag answers 200 with `"notes":0`. A retried rename then gets the same status as the first call, so a client retry is safe. An invalid path tag or `name` answers 400 with the tag error. Other methods on `/tags/:tag` answer 405.
- [ ] Refactor. Consider these candidates and record a verdict for each in the PR body. First, replace the prefix checks in `createApp` with a small route table keyed by path pattern and method, since T2 adds the second resource and T3 adds a third route. Second, keep the regex match inline. Pick the table only if it removes the duplicated 404 and 405 branches.

**You see.**

- [ ] `curl -s -X PATCH localhost:4101/tags/home -H 'authorization: Bearer change-me' -H 'content-type: application/json' -d '{"name":"house"}'` prints `{"tag":"house","notes":2}` with status 200 after two notes were tagged `home`.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `src/notes.test.ts` gains cases for rename, rename into a tag the note already carries, rename of an unknown tag, and rename to the same tag. Run `bun test src/notes.test.ts`.
- [ ] `src/app.test.ts` gains cases for the 200 body, the retry, each 400, the 405, and the 401. Run `bun test src/app.test.ts`.
- [ ] Run the CI steps, `bun run lint`, `bun run typecheck`, and `bun test`. Each exits 0.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on the `volume` agent at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Run T1's lane 3 scenario at trunk and head, then `PATCH /tags/work {"name":"job"}`. Trunk lacks tags and the route, so record its 404 and gate head on the rename plus `GET /notes?tag=job`. Save `t2-regression.png`. Pass when head answers `{"tag":"job","notes":2}` and the filter returns ids 1 and 3.
- [ ] Lane 2. Rename `home` to `house` on two notes. Save `t2-rename.png`. Pass when the body is `{"tag":"house","notes":2}` and `GET /notes?tag=home` returns `[]`.
- [ ] Lane 3. Rename `work` to `home` on a note tagged `["work","home"]`. Save `t2-merge.png`. Pass when that note's tags are `["home"]`.
- [ ] Lane 4. Send the same rename twice. Save `t2-retry.png`. Pass when both answer 200, the second with `"notes":0`, and `GET /notes` matches after each.
- [ ] Lane 5. Rename `home` to `home`. Save `t2-self.png`. Pass when the status is 200 and no note's tags change.
- [ ] Lane 6. Send `PATCH /tags/Home {"name":"HOUSE"}`. Save `t2-case.png`. Pass when the body is `{"tag":"house","notes":<n>}` for the notes tagged `home`.
- [ ] Lane 7. Send `{"name":"a b"}`, `{"name":7}`, `{}`, and a body that is not JSON. Save `t2-invalid-name.png`. Pass when each answers 400 and no note changes.
- [ ] Lane 8. Send `PATCH /tags/a%20b {"name":"x"}` and `PATCH /tags/ {"name":"x"}`. Save `t2-invalid-path.png`. Pass when the first answers 400 and the second answers 404.
- [ ] Lane 9. Send `GET /tags/home`, `DELETE /tags/home`, and `PUT /tags/home`. Save `t2-method.png`. Pass when each answers 405.
- [ ] Lane 10. Send the rename with no token and with a wrong token. Save `t2-auth.png`. Pass when both answer 401 and no note changes.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. The p50 latency of unfiltered `GET /notes` with 1,000 notes at trunk and at head. Trunk lacks the route, so head also measures `PATCH /tags/<t>` across 1,000 notes, 100 of which carry the tag.
- [ ] Probe. Extend `/tmp/perf-t1/probe.ts` with a rename case that renames back and forth between two tags 200 times. Run it at trunk and head in alternation, three times each, each against a fresh server.
- [ ] Baseline. Record the trunk p50 of unfiltered `GET /notes` first.
- [ ] Rule. Head fails if its unfiltered p50 exceeds 1.25 times the trunk p50. The rename fails if its p50 exceeds 5 ms or its p95 exceeds 15 ms.

**Review gate.** None. T2 is not review-gated.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Review-bot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] The root appends T2 to the base-branch stack and the operator lands it bottom-up.

## Count the notes per tag (T3)

**Depends on.** T1, and T2 for its `/tags` routing.

**Files.**

- [ ] Edit `src/notes.ts`.
- [ ] Edit `src/notes.test.ts`.
- [ ] Edit `src/app.ts`.
- [ ] Edit `src/app.test.ts`.

**Build.**

Work test-first per `CLAUDE.md`. Each box below is one Red, Green, Refactor cycle.

- [ ] Red, then green. Add `NoteStore.countTags(): { tag: Tag; count: number }[]` in `src/notes.ts`. It counts the notes that carry each tag. It sorts by count, highest first, then by tag name. A tag that no note carries does not appear.
- [ ] Red, then green. In `src/app.ts`, answer `GET /tags` with 200 and the `countTags()` result. Other methods on `/tags` answer 405.
- [ ] Refactor. Consider these candidates and record a verdict for each in the PR body. First, derive `countTags` and `list(tag)` from one shared walk over the notes. Second, keep two plain loops. The expected verdict is "keep", since a shared helper adds a layer for two callers of four lines each.

**You see.**

- [ ] `curl -s localhost:4101/tags -H 'authorization: Bearer change-me'` prints `[{"tag":"work","count":2},{"tag":"home","count":1}]` with status 200 after three notes tagged `["work"]`, `["work","home"]`, and `[]`.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `src/notes.test.ts` gains cases for the empty store, the sort order with ties, and the count after a delete and after a rename. Run `bun test src/notes.test.ts`.
- [ ] `src/app.test.ts` gains cases for the 200 body, the 405, and the 401. Run `bun test src/app.test.ts`.
- [ ] Run the CI steps, `bun run lint`, `bun run typecheck`, and `bun test`. Each exits 0.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on the `volume` agent at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Run T1's lane 3 setup and then `GET /tags`, at trunk and at head. Trunk lacks the route, so record its 404 and gate head on the counts. Save `t3-regression.png`. Pass when head answers `[{"tag":"home","count":2},{"tag":"work","count":2}]`.
- [ ] Lane 2. Run `GET /tags` on an empty store. Save `t3-empty.png`. Pass when the status is 200 and the body is `[]`.
- [ ] Lane 3. Create notes so `a` has 1, `b` has 3, and `c` has 3. Save `t3-sort.png`. Pass when the order is `b`, `c`, `a`.
- [ ] Lane 4. Delete the only note tagged `a`, then run `GET /tags`. Save `t3-after-delete.png`. Pass when `a` is gone from the list.
- [ ] Lane 5. Rename `b` to `c` with T2's route, then run `GET /tags`. Save `t3-after-rename.png`. Pass when `c` counts every note that carried `b` or `c` once, and `b` is gone.
- [ ] Lane 6. Create notes with untagged bodies only. Save `t3-untagged.png`. Pass when `GET /tags` returns `[]`.
- [ ] Lane 7. Create one note with `["x","X"," x "]`. Save `t3-dedupe.png`. Pass when the body is `[{"tag":"x","count":1}]`.
- [ ] Lane 8. Send `POST /tags`, `PUT /tags`, and `DELETE /tags`. Save `t3-method.png`. Pass when each answers 405.
- [ ] Lane 9. Run `GET /tags` with no token. Save `t3-auth.png`. Pass when the status is 401.
- [ ] Lane 10. Run `GET /tags?tag=x` and `GET /tags/`. Save `t3-query.png`. Pass when the first ignores the query and returns the full count list, and the second answers 404.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. The p50 latency of unfiltered `GET /notes` with 1,000 notes at trunk and at head. Trunk lacks the route, so head also measures `GET /tags` with 1,000 notes spread across 10 tags.
- [ ] Probe. Extend `/tmp/perf-t1/probe.ts` with a `GET /tags` case of 500 sequential requests. Run it at trunk and head in alternation, three times each, each against a fresh server.
- [ ] Baseline. Record the trunk p50 of unfiltered `GET /notes` first.
- [ ] Rule. Head fails if its unfiltered p50 exceeds 1.25 times the trunk p50. `GET /tags` fails if its p50 exceeds 5 ms or its p95 exceeds 15 ms.

**Review gate.** None. T3 is not review-gated.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Review-bot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] The root appends T3 to the base-branch stack and the operator lands it bottom-up.

## Close the program

- [ ] Every box above is checked with its evidence.
- [ ] Reply to the operator with the report the execution playbook names.

## Appendix A. Prototype evidence

No prototype ran. Every open question in this plan is a product call about the API's contract, and no run can settle a product call. The choices below are defaults the operator can overturn before the go.

- Tag rule. `^[a-z0-9_-]{1,32}$` after trim and lowercase. The charset keeps a tag usable as a path segment in `PATCH /tags/:tag`.
- Response shape. Every note carries `tags`, an empty array when untagged. This change edits the bodies of existing routes in T1.
- Rename route. `PATCH /tags/:tag` with `{"name":"<new>"}`. An unknown source tag answers 200 with `"notes":0` rather than 404.
- Count route. `GET /tags` returns every tag with its count, highest first. No `GET /tags/:tag/count` route.

The one empirical claim in the plan, that a full scan of 1,000 notes fits the latency budget, stays unproven until each PR's perf block runs.

## Appendix B. Alternatives rejected

- Omit `tags` on untagged notes. Callers would then handle two shapes of one note. An empty array costs a few bytes and removes the branch.
- Store tags as free text and match them exactly. `Home` and `home` would then count as two tags, and the rename route would need URL encoding rules for any character.
- Answer 404 for a rename of an unknown tag. A client that retries after a timeout would then see an error for a rename that succeeded.
- Keep a tag index in the store. The store lives in memory, and a scan of 1,000 notes is expected to fit the budget. The perf block decides, and an index can follow if it fails.
- Ship T2 and T3 as siblings on T1. Both PRs edit the `/tags` routing in `src/app.ts`, so siblings would conflict at landing. A linear stack moves that conflict into T3's build.
- Hand-chain the PR bases with `gh pr create --base`. The operator's global rule asks for native stacks through `gh stack`.

## Appendix C. Risks

- T1 changes the body of `GET /notes` and `POST /notes`. A client that compares bodies exactly would break. The owner lists the change in the PR body. Lane 1 of T1 watches it.
- T2 widens the guard in `createApp` that answers 404 before the token check. A mistake there could expose `/tags` without auth or turn an unknown path into a 401. Lane 10 of T2 and lane 9 of T3 watch it.
- The API has no screen, so `control-cli` drives it through tmux and `curl`. The `.png` files are rendered transcripts. The `.txt` transcripts are the evidence each lane reads.
- The perf budgets are guesses until the trunk baseline exists. If the trunk p50 already exceeds 5 ms on the worker, the root resets the absolute budgets to three times the trunk p50 and records why.
- T3 depends on T2 for routing only. If the operator drops T2, T3 must be rebased onto T1 and must add the `/tags` guard itself.

## Appendix D. Links and reading list

- Read `src/app.ts`, `src/notes.ts`, and both test files before editing. They are the whole app.
- Read `CLAUDE.md` at the repo root for the test-first rule and the no-ticket-links rule.
- T2 gets `${CLAUDE_PLUGIN_ROOT}/skills/how/SKILL.md` before its routing change, and `${CLAUDE_PLUGIN_ROOT}/skills/interrogate/SKILL.md` on the rename semantics. T1 and T3 get neither.
- Keep a decision trail per `${CLAUDE_PLUGIN_ROOT}/skills/show-me-your-work/SKILL.md`, local and uncommitted.
