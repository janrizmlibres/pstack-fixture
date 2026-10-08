# QA

pstack's release and watch checks run in this repo, so they never touch a real one. The checklist, with every check's tier and surface, is `docs/qa.md` in `janrizmlibres/claude-pstack`. This directory holds what the checks need here:

- `briefs/`: one brief per cloud release check, named after the check's id. A brief is the whole prompt of an unattended cloud session.
- `spec-issue.md` and `spec-comment.md`: the spec issue the spec-intake checks build, and the comment filed on it.

## Before a round

1. A local clone of this repo with `bun install` and `cp .env.example .env`.
2. Locally, the release candidate installed: `claude plugin marketplace add janrizmlibres/claude-pstack#<candidate branch>`, then `claude plugin install pstack@claude-pstack`.
3. A cloud environment named `pstack-qa` whose setup script is the setup line with the candidate's ref, and its id in this clone's `.claude/settings.local.json` (git-ignored):

   ```json
   { "remote": { "defaultEnvironmentId": "env_…" } }
   ```

## Starting a cloud check

From the clone, unattended in Auto:

```bash
script -q /dev/null claude --cloud --permission-mode auto "$(cat qa/briefs/<check>.md)"
```

A few checks need something set up first, or a different start:

| Check | Before you start it |
|---|---|
| `install-clean` | Create a new environment with the candidate's setup line and the environment variable `PLAYWRIGHT_DOWNLOAD_HOST=https://download.invalid`, so the Chromium download fails. Start the brief with `--settings '{"remote":{"defaultEnvironmentId":"<new env id>"}}'`. |
| `pulled-update` | After `pstack-qa`'s setup cache is built, push a marker commit to the candidate branch that adds the line `qa-marker <nonce>` to `pstack/skills/poteto-mode/SKILL.md`, to the reminder hook's output and to the `work` agent's description. Revert the commit after the check. |
| `read-rule-cloud` | Start it without `--permission-mode auto`: it checks default mode. Approve the report push yourself when it asks; nothing else should prompt. |
| `spec-build-cloud` | `scripts/publish.sh` has filed the spec issue as #1. |
| `routine-run-now` | Create a routine on this repo and `pstack-qa` whose prompt is the brief, check its model with `/schedule`, then press Run now. |
| `routine-label` | Create a routine on this repo and `pstack-qa` whose prompt is the brief, fired by a GitHub trigger on pull requests labelled `qa-routine`. Push a branch `qa/routine-label` off `develop` with one empty commit, open a ready (not draft) PR into `develop` whose body asks for a `GET /notes/count` endpoint returning `{ "count": <number of notes> }`, then add the label. |

## Reporting

Every check, cloud or local, ends with a report commit, the same way a pstack worker reports:

1. Commit on your own branch (the one this session pushes to; never another), with `--allow-empty` when nothing else is staged:
   - subject `qa: <check> <PASS|FAIL|BLOCKED>`;
   - body: the evidence, as exact commands and the output lines that decide the check, file paths, branch names, PR numbers;
   - trailers, added explicitly with `--trailer`: `QA-Check: <check>`, `QA-Result: PASS|FAIL|BLOCKED` and `Claude-Session: <this session's URL>`.
2. Push it.

`PASS` means every "Pass when" condition held. `FAIL` means one didn't, and the body says which. `BLOCKED` means the check couldn't be run as written; the body says what stopped it. Never ask the human: a question goes in a `BLOCKED` report. Never delete a branch, and never touch a branch the brief doesn't name.

## Reading the results

```bash
scripts/qa-results.sh
```

prints one row per report on origin: check, result, branch and session, tab-separated. Tick each check on the candidate's tracking issue, linking its branch.

## After a round

```bash
scripts/reset.sh --dry-run   # what it would delete
scripts/reset.sh             # delete the qa/* and claude/* branches, on origin and locally
```

Cloud sessions can't delete branches, so every round ends with this. Deleting a PR's head branch closes the PR.

## Publishing the fixture

```bash
scripts/publish.sh
```

creates whatever is missing on GitHub: the public repo, the `main`, `develop` and `gated` branches, the rulesets in `.github/rulesets` (updated in place when they exist) and the spec issue with its comment. `main` takes a PR and a green `check`; `gated` also takes one approving review, which is what the refused-merge check hits.
