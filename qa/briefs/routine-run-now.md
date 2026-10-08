/pstack:poteto-mode Add `GET /notes/count`, returning `{ "count": <number of notes> }` behind the same token as `/notes`, and open a PR into `develop`.

When the run is done, also report it as QA check `routine-run-now`, as `qa/README.md` says under "Reporting": a commit on your own branch with the trailers `QA-Check: routine-run-now`, `QA-Result` and `Claude-Session`, pushed. The body records the `pstack: surface=… mode=…` line from your first turn, the branch you worked on and the PR you opened.
