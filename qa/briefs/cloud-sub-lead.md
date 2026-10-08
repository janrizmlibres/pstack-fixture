/pstack:poteto-mode QA check `cloud-sub-lead`: a cloud worktree sub-lead starts worktree workers of its own.

Delegate one design question to a single sub-lead in its own worktree: it runs an arena on the shape of a `GET /notes/search?q=<text>` endpoint (case-insensitive substring match on note text, behind the same token as `/notes`), with its runners in worktrees of their own, and returns the winning branch. You integrate the winner into your branch and push it.

Record: `git -C /opt/claude-pstack log -1 --oneline`; the sub-lead's worktree path; each runner's worktree path and branch; which agent spawned each runner; the exact command the sub-lead waited on each runner with; any refusal from the worktree guard, verbatim, with whether pstack's text told the sub-lead to run that command; the blind judge's pick and the sub-lead's pick.

Pass when the runners were spawned by the sub-lead (not by you), each in its own worktree distinct from the sub-lead's and from each other, the sub-lead waited on each with pstack's `scripts/wait-report`, the worktree guard refused none of the commands pstack's text tells it to run (a refused command of its own, which it then split, is recorded but doesn't fail the check), and the sub-lead returned a winner.

Report as `qa/README.md` says under "Reporting": a commit on your own branch with the trailers `QA-Check: cloud-sub-lead`, `QA-Result` and `Claude-Session`, pushed.
