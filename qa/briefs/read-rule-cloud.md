/pstack:poteto-mode QA check `read-rule-cloud`: in default permission mode, pstack's plugin files are read by path with no permission prompt or denial, at depth 0 and in a subagent. Change no code.

1. Quote the `pstack: surface=… mode=…` line: it should read `mode=default`. If it doesn't, report `BLOCKED`.
2. Read the arena skill's `SKILL.md` by path under the plugin root the reminder names, and quote its first heading.
3. Spawn one reader agent (`work-reader`) told to read the interrogate skill's `SKILL.md` by path and return its first heading and any permission error verbatim.

Pass when both reads return their heading with no prompt and no denial.

Report as `qa/README.md` says under "Reporting", with `QA-Check: read-rule-cloud`.
