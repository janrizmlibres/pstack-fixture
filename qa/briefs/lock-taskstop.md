/pstack:poteto-mode QA check `lock-taskstop`: stopping an in-VM subagent that holds the machine lock kills its child processes and frees the lock. Change no code.

1. Spawn one subagent in the background that runs the dev server through pstack's heavy-command wrapper (`bun run dev`; a dev server holds the lock while it is up) and keeps it running.
2. Once it is up, confirm the server process is running (`pgrep -fl src/main.ts`) and record the wrapper's lock evidence.
3. Stop the subagent with `TaskStop`.
4. Confirm the dev server process is gone (`pgrep -fl src/main.ts` prints nothing).
5. Run `bun test src/notes.test.ts` through the wrapper yourself and record how long it says it waited.

Pass when step 4 finds no server process and step 5 got the lock without waiting.

Report as `qa/README.md` says under "Reporting": a commit on your own branch with the trailers `QA-Check: lock-taskstop`, `QA-Result` and `Claude-Session`, pushed.
