QA check `install-clean`: a clean install of the setup line on a newly created environment finishes even when the Chromium download fails. This session runs on that environment. Do not enter pstack; only inspect.

1. `claude plugin list`: pstack from the `claude-pstack` marketplace is installed and enabled.
2. `git -C /opt/claude-pstack rev-parse --abbrev-ref HEAD` and `git -C /opt/claude-pstack log -1 --oneline`: the clone is on the release candidate's branch.
3. `/root/.claude/settings.json` has `env.CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` set to `"3"`, `Read(//opt/claude-pstack/pstack/**)` in `permissions.allow`, and a `SessionStart` hook running `git -C /opt/claude-pstack pull --ff-only`. Quote each.
4. Chromium is absent: `ls ~/.cache/ms-playwright` shows no `chromium-*` directory. If Chromium is present, the forced download failure didn't happen: report `BLOCKED`.

Pass when steps 1 to 3 hold and Chromium is absent: setup finished, or this session would not have started.

Report as `qa/README.md` says under "Reporting": a commit on your own branch with the trailers `QA-Check: install-clean`, `QA-Result` and `Claude-Session`, pushed.
