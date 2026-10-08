/pstack:poteto-mode QA check `compaction-hook-cloud`: pstack's compaction hook fires after a mid-turn auto-compaction in cloud. Change no code.

1. In this one turn, read TypeScript's `lib.dom.d.ts` (run `bun install` first if `node_modules` is missing) into your own context. TypeScript 7 ships it in its platform package, `node_modules/@typescript/typescript-<platform>/lib/lib.dom.d.ts`; `find node_modules/@typescript -name lib.dom.d.ts` prints the path. Read it 2,000 lines per `Read`, start to end and again if needed, until the conversation is auto-compacted. Don't delegate the reading: the point is to fill your own context.
2. After the compaction, quote verbatim the message the compaction hook added: it says you were compacted and lists the durable state to re-read.
3. Follow it: re-read what it lists, and record what that was.

Pass when the hook's message appeared after the compaction and listed poteto-mode's `SKILL.md` first.

Report as `qa/README.md` says under "Reporting": a commit on your own branch with the trailers `QA-Check: compaction-hook-cloud`, `QA-Result` and `Claude-Session`, pushed.
