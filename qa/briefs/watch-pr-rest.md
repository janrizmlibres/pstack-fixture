/pstack:poteto-mode QA check `watch-pr-rest`: `watch-pr` reads review threads through the cloud REST reader on a real PR.

1. On your own branch, change one line of `README.md`, push, and open a PR into `develop` with `gh api` REST.
2. Add one review comment on the changed line with `gh api` REST (`repos/janrizmlibres/pstack-fixture/pulls/<n>/comments`, with `commit_id`, `path`, `line` and `side: RIGHT`).
3. Run pstack's `watch-pr` on the PR and record its full output.

Pass when `watch-pr` used the REST reader (GraphQL is refused here), read `/ccr/review_threads`, reported one unresolved thread on the changed line, and so did not call the PR ready.

Report as `qa/README.md` says under "Reporting", with `QA-Check: watch-pr-rest`.
