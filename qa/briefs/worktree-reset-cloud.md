/pstack:poteto-mode QA check `worktree-reset-cloud`: a cloud worktree worker starts from the lead's HEAD, and the lead excludes `.claude/worktrees/`.

1. On your own branch, commit (don't push yet) a one-line change to `README.md` that adds the line `worktree-reset-cloud marker`. Record the commit's SHA.
2. Delegate, to one code-writing worker in its own worktree: add `GET /notes/count`, returning `{ "count": <number of notes> }` behind the same token as `/notes`. Brief it as pstack's brief contract says, naming that SHA as its start commit.
3. When it reports, record: the worker's worktree path; the first commit its branch is based on (`git merge-base` with your branch); whether its tree has the `README.md` marker line; and `.git/info/exclude` in your checkout.
4. Integrate its result into your branch and push.

Pass when the worker's branch starts at the SHA from step 1 (the marker line is there, though it was never pushed), its worktree is under `.claude/worktrees/`, and `.git/info/exclude` lists `.claude/worktrees/` exactly once.

Report as `qa/README.md` says under "Reporting", with `QA-Check: worktree-reset-cloud`.
