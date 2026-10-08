# pstack-fixture

A throwaway repo that pstack's release and watch checks run in, so they never touch a real one. It's a small notes API on Bun and TypeScript, plus what the checks need: a real test suite, lint and a dev server; a git-ignored `.env` the app needs; a `develop` branch for PRs on a non-default base; a `gated` branch that needs an approving review; a spec issue to build; a `CLAUDE.md` whose rules conflict with pstack's defaults; and commit attribution turned off in `.claude/settings.json`.

## Running it

```bash
bun install
cp .env.example .env
bun test
bun run lint
bun run typecheck
bun run dev
```

## QA

How to run a check, the briefs, the report contract and the reset are in `qa/README.md`.
