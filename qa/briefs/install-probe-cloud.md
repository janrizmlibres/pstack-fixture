/pstack:poteto-mode QA check `install-probe-cloud`: re-run the cloud column of the marketplace and cloud plugin-install probe on the release candidate. Change no code. Record each item's exact output.

1. Slash entry: the poteto-mode skill body is in context (quote its first heading).
2. The reminder hook fired this turn, and its skill path shows `${CLAUDE_PLUGIN_ROOT}` expanded to a path under `/opt/claude-pstack/` (quote it).
3. `${CLAUDE_PLUGIN_ROOT}` is substituted in a skill body and an agent body: quote one path from each.
4. The model choices from the setup line's `--config` reach skill text: quote where the setup-pstack skill shows the Work, Judgement and Volume models.
5. Depth 3: `echo $CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` here prints `3`. Spawn a writer subagent (depth 1) that spawns a reader (depth 2); the reader reads a hidden sibling skill (the arena skill's `SKILL.md`) by path and returns its first heading; each level reports the variable and whether it has the Agent tool.
6. The reminder hook fired again on the turn the depth-1 result came back (quote its surface line).

Pass when every item holds.

Report as `qa/README.md` says under "Reporting": a commit on your own branch with the trailers `QA-Check: install-probe-cloud`, `QA-Result` and `Claude-Session`, pushed.
