/pstack:poteto-mode QA check `pulled-update`: record which parts of a pstack update pulled by the cloud `SessionStart` hook take effect in the same session. Change no code.

The release candidate gained a marker commit after this environment's setup cache was built. It adds a line `qa-marker <nonce>` to poteto-mode's `SKILL.md`, to the reminder hook's output and to the `work` agent's description.

1. `git -C /opt/claude-pstack log -1`: quote the marker commit, which shows the hook pulled it. If the marker commit isn't there, report `BLOCKED`.
2. For each part, say whether the marker reached this session: the poteto-mode skill body the slash command expanded; the reminder hook's output this turn; the `work` agent's description in your agent list; a fresh `Read` of the skill file.
3. Record the result as a table: part, marker seen (yes or no), evidence.

Pass when step 1 shows the marker commit and the table covers all four parts. The table is the result; the README states it.

Report as `qa/README.md` says under "Reporting", with `QA-Check: pulled-update`, the table in the body.
