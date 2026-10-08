/pstack:poteto-mode QA check `wip-push-cloud`: Pause safely's `wip:` commit is pushed to this session's own branch in cloud.

1. Start on: add a `tags` field to notes (an empty list for now) in `src/notes.ts`, test-first. Stop part way, with the change uncommitted.
2. Pause safely, as poteto-mode's Pause safely says.
3. Record `git log -1 --format=%B origin/<your branch>` and `git status`.

Pass when origin has a `wip:` commit on your own branch whose body is the resume note.

Report as `qa/README.md` says under "Reporting": a commit on your own branch with the trailers `QA-Check: wip-push-cloud`, `QA-Result` and `Claude-Session`, pushed. The report commit goes on top of the `wip:` commit.
