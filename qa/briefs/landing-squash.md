/pstack:poteto-mode QA check `landing-squash`: with a landing grant, a cloud run squash-merges into the protected `main` once its check is green.

Add `GET /notes/:id`, returning the note or 404, behind the same token as `/notes`. Open a PR into `main`. You have a landing grant for this PR: land it once the required `check` is green.

Record: the PR number; the `check` run's conclusion; the exact merge call and its response; the leftover branches your reply lists and its `git push origin --delete` line.

Pass when the PR was squash-merged through `gh api` REST after `check` went green, with no retry and no workaround, and the reply lists the leftover branches with one delete line.

Report as `qa/README.md` says under "Reporting": a commit on your own branch with the trailers `QA-Check: landing-squash`, `QA-Result` and `Claude-Session`, pushed.
