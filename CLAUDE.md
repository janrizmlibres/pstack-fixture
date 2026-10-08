# pstack-fixture

A small notes API on Bun and TypeScript. The app is in `src/`; the QA tooling for pstack's release checks is in `qa/` and `scripts/`.

## Commands

- `bun install`, then `cp .env.example .env`: the app and its test suite need `.env`.
- `bun test`: the whole suite. `bun test src/notes.test.ts` runs one file.
- `bun run lint` (Biome) and `bun run typecheck` (tsc).
- `bun run dev`: the dev server, on `PORT` from `.env`.

## Rules

- **Test-first, always.** Every behaviour change starts with a failing test that you run and watch fail for the expected reason. Then write the least code that passes it, then refactor with the suite green. No production code without a failing test first, including in delegated work.
- **No ticket links.** Code, comments and commit messages never link to or cite an issue, ticket, pull request, RFC or any other URL, and never name one by number. A comment states its rule inline, in full; if a constraint needs a reference to make sense, the comment is not done yet.
