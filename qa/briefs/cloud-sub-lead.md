/pstack:poteto-mode QA check `cloud-sub-lead`: a cloud worktree sub-lead starts worktree workers of its own.

Delegate one design question to a single sub-lead in its own worktree: it runs an arena on the shape of a `GET /notes/search?q=<text>` endpoint (case-insensitive substring match on note text, behind the same token as `/notes`), with its runners in worktrees of their own, and returns the winning branch. You integrate the winner into your branch and push it.

Record: the sub-lead's worktree path; each runner's worktree path and branch; which agent spawned each runner; the blind judge's pick and the sub-lead's pick.

Pass when the runners were spawned by the sub-lead (not by you), each in its own worktree distinct from the sub-lead's and from each other, and the sub-lead returned a winner.

Report as `qa/README.md` says under "Reporting": a commit on your own branch with the trailers `QA-Check: cloud-sub-lead`, `QA-Result` and `Claude-Session`, pushed.
