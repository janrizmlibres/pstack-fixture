/pstack:poteto-mode QA check `session-trailer-cloud`: a cloud worker's report commit keeps its `Claude-Session:` trailer although this repo sets `attribution.commit` to `""`.

Delegate, to one code-writing worker in its own worktree: add `DELETE /notes`, which removes every note and answers 204, behind the same token as `/notes`. Integrate its result into your branch and push.

Record the trailers of the worker's report commit (`git log -1 --format=%B <its branch>`) and confirm `.claude/settings.json` sets `attribution.commit` to `""`.

Pass when the report commit carries `Pstack-Status:` and `Claude-Session:` trailers and no `Co-Authored-By:` line.

Report as `qa/README.md` says under "Reporting", with `QA-Check: session-trailer-cloud`.
